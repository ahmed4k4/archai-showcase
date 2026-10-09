# Light mode overhaul (v3 -> v4)

## New file
- css/light.css — "Daylight Circuit": all light-theme component styling (scoped to data-theme="light").

## Modified
- css/variables.css — light palette rewritten (indigo-tinted canvas, white cards, AA deep amber primary, deep teal accent, indigo shadows).
- css/hero.css — hero bottom padding + scroll hint moved below the CTAs (overlap bug, both themes).
- css/app.css — sidebar logo no longer stretched; project-page <aside> reset (it inherited dashboard-sidebar styles).
- js/core.js — footer "(c) {year}" placeholder is now replaced with the current year (was shown literally).
- index.html, project.html, login.html, dashboard.html — link css/light.css.

## Unchanged
Other JS files, schema.sql, dark theme palette.
