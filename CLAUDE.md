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
