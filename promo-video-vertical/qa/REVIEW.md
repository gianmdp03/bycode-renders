# Portrait QA

Composition: `Pointly-Vertical-Master`, 1080×1920, native 60 FPS, 3828 frames / 63.8 seconds.

## Checks

- All ten scene components have their own portrait layout and standalone Studio composition. No horizontal master is embedded or cropped as a complete frame.
- Studio opened on port 3002. Preview metadata and all twenty scene start/end frames were checked without a current runtime error.
- Reviewed the 49 timeline/interaction stills and full-resolution catalog, retention, QR and CTA layouts. Key headings remain above the product surfaces; important content stays within the 80 px horizontal / 100 px outer safe area. Merchant tabs deliberately use a focused horizontal crop; catalog content deliberately scrolls inside its frame.
- All 15 interaction targets were measured in the live Studio DOM, immediately before their click/tap. The cursor/tap point falls inside the intended control for branch detail, save rules, QR, registration, amount, purchase confirmation, lookup, catalog, redeem, redemption confirmation, promotion save, inactivity filter, templates, return to inactive customers and WhatsApp draft.
- Source action frames match all 19 original audio cues. Audio duration is 63.8 seconds with a measured default-mix peak of −19.94 dBFS. Music is not sped up. No clipping; final listening volume and encoded playback remain manual checks.
- Award-to-balance card coordinates match at the cut. Catalog content and scroll position are shared across the catalog/redemption cut. Promotion card remains in place when moving from merchant to customer. The QR contracts above the rising phone; the final CTA separates the product cards vertically.
- `verify-project.mjs` verifies duration, contiguous scene timing, ledger, cue schedule and package compatibility. `verify-preservation.mjs` verifies the horizontal source/asset hashes plus exact narrative timing, demo data and audio copies. ESLint and TypeScript pass.

## Corrections made during portrait QA

Repositioned the branch-detail and QR cursor targets using measured button bounds; centered the balance lookup cursor; separated the award card from the sales heading and lookup button; sized the stacked reward cards to their content; moved the catalog callout below the product panel so it cannot be confused with the second reward; separated the closing footer from the decorative reward card.

Also restored the gift/message icons on their corresponding modals and normalized shared card borders to remove a React shorthand/longhand warning during state changes. The state-change check then produced no new console warnings or errors.

All corrections are confined to this vertical project. No scene or meaningful product feature was removed. No MP4 was rendered.
