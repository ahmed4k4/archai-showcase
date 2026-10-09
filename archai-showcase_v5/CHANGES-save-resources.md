# v4 -> v5 : lower backend usage

## Existing Supabase project? Run ONCE: supabase/migrations/002_save_resources.sql
(Fresh installs: schema.sql already includes everything.)

## Requests / logs (Log Ingestion)
- js/public.js: homepage data cached 5 min in sessionStorage -> repeat visits = 0 data requests.
- js/public.js: project page reuses that cache for "related" (no extra queries); cold load = 1 query
  instead of 3 (removed the separate categories query, related limit 30 -> 12, narrower image columns).
- js/core.js: shorter session id (20 chars), referrer sent as hostname only.

## Egress / file storage
- js/admin.js: images compressed to max 1400px WebP q0.8 (was 1600 / 0.85).
- js/admin.js: a 480px thumbnail is uploaded with every image; project cards load the thumbnail
  (~20 KB) instead of the full image. Old images without a thumbnail keep working.
- js/admin.js: uploads get a 1-year Cache-Control (file names are unique) -> browsers don't re-download.
- js/admin.js: deleting an image/project also removes its thumbnail from Storage.
- supabase: bucket accepts only WebP, max 1.5 MB per file.

## Database size
- Raw analytics kept 90 days (was 180); nightly purge via pg_cron.
- Narrower stored text: referrer hostname (80), page (60).
- schema.sql / migration: thumb_path, thumb_url, cover_thumb columns.
