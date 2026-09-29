# QA REPORT — The Twist Bar Locs & Naturals

Run on 28–29 Sep 2026 against a local server, with Playwright (Chromium) and Lighthouse 12. Result: **161 of 161 automated checks passed**, plus the visual review and Lighthouse runs below.

## Visual review
Every page (index, services, loc-rescue, loyalty, gallery, visit, 404) was captured full-page at **390×844** and **1440×900** and reviewed by eye. Viewport captures mid-scroll were used to check the motion states (spine, dividers, headline twists, card tilts). Issues found and fixed during review:
- Hero "Twisted." wrapped its period onto its own line at 1440. Resized and set to no-wrap.
- The hero helix overflowed into the copy on mobile. It is now clipped to its frame.
- The mobile menu panel was trapped inside the header's backdrop-filter. It moved outside the header and now opens full screen.
- The sticky category chips on Services had light text on a light background. They are restyled.
- Menu items in two-column rows stretched unevenly. Fixed with `align-content: start`.
- An FAQ question double-escaped a quotation mark (`&ldquo;`). Fixed, and the JSON-LD text is unescaped too.
- The hours card had a low-contrast eyebrow and note. Both are recoloured.
- The badge ring text overlapped itself. It is now fitted to the circle with `textLength`.
- Tilted gallery cards caused 11px of horizontal overflow at 320px. The page is now clipped on `html`.
- The mobile footer was one long column. It is now two columns, with the visit block spanning both.

## Automated gate (all PASS)
| Check | Result |
| --- | --- |
| Console errors, 7 pages × 320 / 390 / 1440 | 0 |
| Horizontal overflow at 320 / 390 / 1440 | none (scrollWidth = viewport) |
| Internal links, assets, srcset entries and in-page anchors (crawled from every `href` / `src` / `srcset`) | all resolve. External links are only Booksy, Instagram, Google Maps, tel: and couturehouse.co |
| CSS `url()` references and manifest icons | all resolve |
| JSON-LD blocks (HairSalon + OfferCatalog of all 50 services, WebSite, FAQPage ×3, BreadcrumbList ×5, Service, ImageGallery) | all parse. No aggregateRating or Review markup |
| Exactly one `<h1>` per page | yes |
| Every `<img>` has alt, width and height | yes (one decorative logo uses `alt=""`) |
| Duplicate ids | none |
| Emoji scan of all site text files (HTML/CSS/JS/MD/TXT/XML/TOML/SVG) | none |
| Titles ≤ 60 chars, descriptions ≤ 158 chars | yes |
| Tap targets ≥ 44px at 390 (visible links, buttons, inputs; the checkbox counts through its 44px label) | yes |
| Body text ≥ 16px at 390 | yes |
| WCAG AA contrast of all 17 text/background pairs in use | all ≥ 4.5:1 (lowest: honey on red 5.45:1; amber on oxblood 7.92:1; ink-soft on cream 8.63:1) |
| Reduced motion (`prefers-reduced-motion: reduce`) | all headings, twists, rises, tilts and images fully visible. Lenis is off and the motion libraries are not loaded |
| JavaScript disabled | hero headline and all content visible |
| Mobile menu | opens with aria-expanded=true. Escape closes it and returns focus to the toggle. Tab is trapped while open |
| Services search | "micro" returns filtered results with a live status. An unmatched query shows an empty-state hint |
| Gallery | Color filter shows 7 of 16. The lightbox opens with focus inside, arrow keys move between photos, Tab stays inside, and Escape closes it and returns focus to the opening photo |
| Netlify form on localhost | shows the local "goes live on Netlify" message and nothing is posted |
| Production CSP (`netlify.toml` header injected, all 7 pages, scrolled to the bottom) | 0 violations and 0 external requests |

## Lighthouse (mobile, simulated slow 4G, compressed local server)
| Page | Performance | Accessibility | Best practices | SEO |
| --- | --- | --- | --- | --- |
| index | 95 | 100 | 100 | 100 |
| services | 99 | 100 | 100 | 100 |
| loc-rescue | 99 | 100 | 100 | 100 |
| loyalty | 100 | 100 | 100 | 100 |
| gallery | 97 | 100 | 100 | 100 |
| visit | 98 | 100 | 100 | 100 |
| 404 | 100 | 100 | 100 | 66 (intentional `noindex`) |

CLS is 0 on every page. Performance work that got there:
- The motion libraries load after first paint.
- Each page preloads only the fonts it needs.
- The hero image gets a 960w variant, and all photos get 420w variants in `srcset`.
- The hidden mobile hero thumbnail is lazy-loaded.
- Reveal animations run on IntersectionObserver instead of one ScrollTrigger per card.
- The hero headline is never hidden: its letter twist runs after it has painted.

## Notes
- Eyebrow labels (uppercase, tracked) are 16px, so they also meet the body-text rule.
- Screenshots and QA scripts were kept outside the site folder. Nothing temporary is left in it.
