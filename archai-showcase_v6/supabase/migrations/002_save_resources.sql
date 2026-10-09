-- ============================================================
-- 002_save_resources.sql — run ONCE on an existing Supabase project
-- (fresh installs already get all of this from schema.sql)
-- ============================================================

-- 1) thumbnail columns (cards load ~20 KB thumbs instead of full images)
alter table public.project_images add column if not exists thumb_path text;
alter table public.project_images add column if not exists thumb_url text;
alter table public.projects add column if not exists cover_thumb text;

-- 2) slimmer analytics rows: referrer -> hostname only, shorter page strings
update public.visitor_sessions
   set referrer = left(substring(referrer from '^https?://([^/:?#]+)'), 80)
 where referrer ~* '^https?://';
update public.visitor_sessions set referrer = left(referrer, 80) where length(referrer) > 80;
update public.page_views set page = left(page, 60) where length(page) > 60;

-- 3) tracking function with the shorter limits
create or replace function public.track_visit(
  p_session text, p_page text, p_device text default 'desktop', p_browser text default null,
  p_os text default null, p_referrer text default null, p_referrer_type text default 'direct',
  p_project uuid default null)
returns void language plpgsql security definer set search_path = public as $$
begin
  if p_session is null or length(p_session) not between 16 and 64 then return; end if;
  insert into visitor_sessions(session_id, device_type, browser, os, referrer, referrer_type)
  values (p_session,
    case when p_device in ('desktop','mobile','tablet') then p_device else 'desktop' end,
    left(p_browser,40), left(p_os,40), left(p_referrer,80),
    case when p_referrer_type in ('direct','search','referral','other') then p_referrer_type else 'other' end)
  on conflict (session_id) do update set last_seen_at = now()
    where visitor_sessions.last_seen_at < now() - interval '1 minute';
  if not exists (select 1 from page_views where session_id = p_session and page = left(p_page,60)
                 and created_at > now() - interval '5 seconds') then
    insert into page_views(session_id, page) values (p_session, left(p_page,60));
  end if;
  -- project view: published only, same session+project counted once per 30 minutes
  if p_project is not null
     and exists (select 1 from projects where id = p_project and status = 'published')
     and not exists (select 1 from project_views where session_id = p_session and project_id = p_project
                     and created_at > now() - interval '30 minutes') then
    insert into project_views(project_id, session_id) values (p_project, p_session);
  end if;
end $$;

-- 4) retention: keep 90 days of raw analytics (was 180)
create or replace function public.purge_old_analytics(p_days int default 90) returns void
language sql security definer set search_path = public as $$
  delete from visitor_sessions where last_seen_at < now() - make_interval(days => p_days);
$$;
revoke execute on function public.purge_old_analytics(int) from public, anon, authenticated;
do $$ begin
  create extension if not exists pg_cron;
  perform cron.unschedule('purge-analytics');
exception when others then null; end $$;
do $$ begin
  perform cron.schedule('purge-analytics', '0 3 * * *', 'select public.purge_old_analytics(90)');
exception when others then
  raise notice 'pg_cron unavailable - run: select public.purge_old_analytics(90); from time to time';
end $$;
select public.purge_old_analytics(90);   -- one-off cleanup now

-- 5) storage: only compressed WebP, max 1.5 MB per file
update storage.buckets
   set file_size_limit = 1572864, allowed_mime_types = array['image/webp']
 where id = 'project-media';

-- 6) reclaim space (optional, run separately if you want): VACUUM (ANALYZE) public.page_views;
