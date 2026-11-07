# SMR website: notes for Claude

Owner: Summar (SMR Graphics / SMR Digital / SMR Plates, Luton). He edits the site by messaging Claude. Make only the change asked, keep everything else as is, check it on a phone-sized screenshot (390px wide) and on desktop, then commit and push to `main`. Pushing to `main` deploys to the live server automatically through `.github/workflows/deploy.yml` (FTP, credentials in GitHub secrets).

## Structure
- One static site for smrgraphics.co.uk and smrdigital.co.uk. `index.html` holds all CSS, HTML and JS; `plate.js` renders the number plates; images live in `assets/`.
- Three tabs: Graphics, Digital, Plates (`#graphics`, `#digital`, `#plates`). The hostname picks the default tab (`smrdigital` → Digital).
- Dark theme, mobile-first. Brand gradient: Graphics blue→purple, Digital purple→pink, Plates yellow→orange. Fonts: Sora (headings), Manrope (body), Poppins light (logo sub-word).

## Contact (the `CONTACT` object at the top of the main script)
- WhatsApp / phone: 07931 814538 (`wa.me/447931814538`). Every form and the plate Order button open WhatsApp with the details pre-filled; there is no back end or database.
- Email: Summar@smrgraphics.co.uk
- Instagram: @smr.graphics, @smrdigitaluk, @smr.plates. Footer shows icon + handle only (no "Follow" wording); each contact block has an Instagram row. The owner asked for no follow buttons in the hero sections.

## Plate builder rules
- Steps: 1 Letters (Standard, 3D Gel, 4D, 4D Gel, Bevelled) · 2 Plate (Standard, Short, Hex, Oversized, Motorcycle) · 3 Extras (Tint, Border) · 4 What do you need? (Full set / Front only / Rear only). A Front/Rear preview switch sits at the top.
- Rear plates are yellow, fronts white, no UK badge.
- Hex: no border. Motorcycle: Standard or 3D Gel letters only, no tint, rear only.
- Font: traced from the Charles Wright reference (79mm tall, 57mm wide, 14mm stroke, 11mm gaps, 33mm between groups; "1" is a plain bar). Glyph outlines are in `plate.js`; don't swap in a web font.
- Oversized = same width, taller plate, same letter size. Motorcycle = two lines with bigger letters.

## Content
- Client logo carousel "Trusted by businesses & charities" on Graphics and Digital: `assets/clients/*.webp`, listed in `CLIENTS` in index.html. Logos have backgrounds removed and were recoloured only where needed for contrast on dark.
- Digital: "Recent work: Smash N Wings, Bedford" (laptop + phone mockups) sits above Websites & apps.
- Plates order: builder → USP strip → Instagram auto-carousel (@smr.plates posts) → plate styles → private reg search.
- Graphics hero: pull-up banner, business card, leaflet, hoodie, spinning "SMR GRAPHICS • DESIGN • PRINT" badge (only the text ring spins).

## Private Demo Manager (`/demo/`, `/demo-admin/`)
- PHP + SQLite on the same SiteGround plan. No other services.
- `/demo-admin/`: owner logs in with a PIN (starting PIN hash is `ADMIN_PIN_HASH` in bootstrap.php; once he changes it under Account, the bcrypt in the `admin` table is used). Login is rate-limited per IP and overall. Installable as a home-screen app "SMR Admin" (manifest + icons in demo-admin/). Tabs: My demos (landing page: one row per app, icon + name + "Updated" date, tap opens it in owner view, ⋯ opens a bottom sheet with Open / Send this demo / Edit / Change icon / Replace ZIP / Hide / Delete), Send (pick apps, their name and WhatsApp number, Create link → editable message, singular/plural wording, "Send on WhatsApp"; More options: shared timer default, 45 min default, feature tour on/off; then Live (status, opened time, last app viewed, live countdown, Extend sheet +10/+15/+30/+60, End now, ⋯ Copy / WhatsApp again / New PIN / Delete; Recent activity feed). Owner view /demo/?preview=1#app=slug has a Home button back to /demo-admin/#demos (bare preview redirects there).
- Notifications: Web Push from PHP (demo-lib/push.php: RFC 8291 aes128gcm + VAPID, keys made once in private storage; demo-admin/sw.js shows them). Events (table `events`): opened (on PIN redeem), low (5 min left, fired from the visitor's state poll), ended. Sent after the response with fastcgi_finish_request so visitors never wait. iPhone needs SMR Admin added to the Home Screen before notifications can be turned on (Settings sheet or Live tab).
- Links look like `smrgraphics.co.uk/app-demo/<app-name(s)>/<TOKEN>` (root .htaccess rewrite to demo/index.php?k=; the name part is decoration from `link_path()`; 4+ apps → `smr-digital-apps`). `/demo/?k=TOKEN` still works. Visitor cookie path is `/`.
- No zoom anywhere (showroom, admin and every app): viewport maximum-scale=1/user-scalable=no (serve.php rewrites each app's viewport meta), touch-action:manipulation, and pinch gesture events blocked.
- `/demo/?k=TOKEN`: PIN screen shows the icons of the apps in that link; visitor enters the PIN, then sees the showroom ("Have a look at our apps") (fixed SMR header with countdown, All Demos, menu, Exit). Apps open in a same-origin iframe from `/demo/run/<slug>/`, which goes through `demo/serve.php` (checks session, allowed app, expiry; injects light copy deterrents; blocks service workers and .map files). The server is the only clock. Opening an app clears its local/session storage so it starts fresh (intro plays). The per-app "Feature tour" (tips in seeds.json, written for the business owner being pitched) appears 4s after opening, small and see-through in the top right, and folds into a "? Features" pill. Changing a slug's version in seeds.json also overwrites its name/tagline/description/tips/order in the database.
- Code: `demo-lib/bootstrap.php` (shared, denied), `demo/` (index, api, serve, icon), `demo-admin/` (index, api). Database and uploaded ZIPs live outside public_html in `../smr-demo-private/` (fallback `demo-data/private/`, denied).
- Demos shipped with the site are packed as `demo-data/seed/<slug>.pack.php` (PHP that exits if requested, followed by a ZIP of `app/` + `icon.webp`) and unpacked once per version into private storage. Never put raw app files in the web root: SiteGround's nginx serves static files directly and ignores .htaccess denies. Metadata: `.github/tools/seeds.json` → generated `demo-data/seed/seeds.php`.
- "Update demo apps": fetch the latest artifact files into a work folder `<src>/<slug>/` (icons in `<src>/_icons/<slug>.webp`), bump that slug's `version` in `.github/tools/seeds.json` (this also re-points a demo that was replaced by ZIP), run `python3 .github/tools/pack_demos.py <src> <slug>`, commit, push. Check with the manual workflow "Check demo protection". Artifact slugs: mikael f89ef29d-09ab-45f8-b8ee-532b5f7ebc6f, allure c52cd17f-5dd1-4135-9c7f-6e4ca6eb7b6d, goldwash 697a70d7-7712-4dc1-81ac-b2b955477787, kaya c1925389-ad6e-4ced-84ac-393e6ff72f87, crave 8d0b1845-57f3-4211-a2db-becfb3f4754e, cafegrill cf270c9a-c41e-4d5a-9692-d847ead41a01, chunk f910ea26-2986-4fd4-9f48-f5907d1b8566, flava 92d03168-d262-4762-a0e5-56765dffc541, valor 1b4c7c9a-e4ff-481a-b260-7b81c665be2c. Gold Wash's hero.mp4 is too big to fetch from the artifact (poster image shows instead). Icons for Allure/Kaya/Flava/Valor were composed from each app's own logo.
- smrdigital.co.uk does not resolve in DNS yet; demo links use the host the admin is on (smrgraphics.co.uk).
