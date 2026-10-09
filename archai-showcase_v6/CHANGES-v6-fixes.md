# v5 -> v6 : fixes

## Category active/inactive toggle "does nothing"
Cause: the 5-minute public-data cache added in v5. The dashboard cleared only its own tab's cache,
so the public site kept showing the old categories.
- js/core.js: cache version now lives in localStorage (shared by all tabs of the browser) and every
  admin change bumps it -> the public tab refreshes immediately. TTL reduced 5 min -> 60 s
  (other visitors/devices see a change within 60 s).
- js/admin.js: the toggle now verifies the row was really updated (RLS can reject silently) and
  shows an error + reverts the switch if not. Image role changes also invalidate the cache.
- js/public.js: TTL 60 s.

## Tracking
- js/core.js: visits by a logged-in admin were silently skipped (looked like "tracking doesn't work"
  when testing). They are tracked now. To exclude one browser: localStorage.setItem("archai:notrack","1").
- js/core.js: visitor session id is shared across tabs (localStorage, renewed after 30 min idle) instead
  of one session per tab -> unique-visitor numbers are no longer inflated by "open in new tab".

## No SQL changes in this version (schema.sql / migration unchanged).
