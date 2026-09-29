# The Twist Bar Locs & Naturals — website

A complete, launch-ready static website for **The Twist Bar Locs & Naturals** (owner and stylist Tia Murray), 4135 Rivers Ave, Unit A, North Charleston, SC. Built as a spec site by Couture House Co. (hello@couturehouse.co).

Design direction: **"Culture Fly"** — oxblood, rich red, amber gold, honey and cream, taken from the salon's own Culture Fly artwork. DM Serif Display for display type, Outfit for UI and body.

Signature motion: **"The Twist"** — a two-strand helix (gold and cream strands that pass over and under each other) that winds as you scroll. It runs down the left gutter of the home page on wide screens (with a gold loc-cuff bead that tracks your progress down the page), wraps the hero photo, and draws itself across the section dividers. Headlines twist into place letter by letter; photo cards tilt in.

## Pages
| File | Page |
| --- | --- |
| `index.html` | Home: hero, ratings, about Tia, signature services, Loc Rescue teaser, loyalty, work, reviews, FAQ + quick facts, visit, CTA |
| `services.html` | Full 50-service menu grouped in 9 categories, sticky category chips, live search, price note, house rules |
| `loc-rescue.html` | "I messed up. Can you save my locs?" 3-month repair program and the "I need everything done" reset |
| `loyalty.html` | Twist Bar Family perks, gift cards, product-line "Get notified" form (Netlify Forms) |
| `gallery.html` | Filterable gallery with an accessible lightbox |
| `visit.html` | Address, hours, directions, booking steps, policies, FAQ |
| `404.html` | Not-found page |

## Stack
- Static HTML, one stylesheet (`assets/css/site.css`), one script (`assets/js/site.js`). The only inline script is the one-line `.js` class toggle in each page head, allowed by its SHA-256 hash in the CSP (`netlify.toml`). If you change that line, recompute the hash.
- Vendored, self-hosted libraries in `assets/vendor/`: GSAP 3.15 (ScrollTrigger, SplitText, DrawSVGPlugin) and Lenis 1.3. `site.js` loads them just after the page has painted (so they never delay the first view), and skips them entirely for visitors who prefer reduced motion.
- Self-hosted fonts in `assets/fonts/`. No CDNs, no third-party requests, no build step.
- All motion respects `prefers-reduced-motion` and the site is fully usable with JavaScript off.

## Preview locally
```bash
npx serve .
# or
python3 -m http.server 8000   # then open http://localhost:8000
```
The product-line form shows a friendly "goes live on Netlify" message when previewed locally.

## Deploy (Netlify, drag and drop)
1. Go to https://app.netlify.com/drop and drag this whole folder in.
2. Rename the site to `the-twist-bar-locs-naturals` (Site settings > Change site name) so it matches the canonical URLs.
3. Forms: Netlify detects the `product-line` form automatically. Turn on email notifications in Site settings > Forms > Form notifications and send them to Tia.
`netlify.toml` already sets security headers (strict CSP), long caching for `/assets/*`, pretty URLs (`/services`, `/visit` ...), `/book` as a shortcut to Booksy, and the 404 page.

## Connecting Tia's own domain
The domain in her Instagram bio, `thetwistbarnaturalhairsalon.com`, does not currently load (see LAUNCH-NOTES.md). Once a domain is connected in Netlify:
1. Find and replace `https://the-twist-bar-locs-naturals.netlify.app/` with the new domain (for example `https://thetwistbarnaturalhairsalon.com/`) across all `.html` files, `sitemap.xml`, `robots.txt` and `llms.txt`.
2. Re-deploy, then submit `sitemap.xml` in Google Search Console and add the website link to the Google Business Profile, Booksy and the Instagram bio.

## Editing
- Services and prices live in `services.html` (and the matching summary on `index.html`, the JSON-LD `hasOfferCatalog`, and `llms.txt`). Update all four when a price changes.
- Hours appear in the footer of every page, the hours tables, the FAQ answers, JSON-LD and `llms.txt`.
- Colors and type are CSS custom properties at the top of `assets/css/site.css`.

See `LAUNCH-NOTES.md` for everything that must be confirmed with Tia before launch, and `QA-REPORT.md` for the checks that were run.

Website concept by Couture House Co. — https://www.couturehouse.co
