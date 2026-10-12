# Portrait QA handoff

- Main composition: `Syntah-Vertical`, 1080 × 1920, 60 FPS, exactly 1440 frames / 24.000 seconds.
- All six scenes retain the horizontal order and frame boundaries: 0, 180, 300, 600, 900, 1140, ending at frame 1439.
- ESLint and TypeScript passed.
- Every frame evaluated successfully. No browser runtime errors or warnings, including React warnings. See `verification.json`.
- Remotion Studio opened at http://localhost:3040/Syntah-Vertical. Native Play advanced the timeline and looped; pause and frame seeking worked. The initial WebMCP play call did not advance, but the ordinary Studio Play control did. No project change was needed for playback.
- Studio console had no errors or warnings. Current-error tool returned null.
- Inspected full-resolution PNGs for all scenes, both click moments, the ecosystem transition and final frame. Enlarged UI, logos, text wrapping, spacing and portrait balance checked. No obvious unintended clipping or overflow was found. The ecosystem transition was adjusted to avoid a blank intermediate card.
- Browser DOM bounds checked at frames 90, 240, 382, 480, 686, 780, 918, 1020, 1320 and 1439. Visible leaf text stayed within a 60 px side/top and 120 px bottom guide, apart from the deliberately full-width centered opening text container; the actual centered word is comfortably inside the guide and was visually inspected. Main product panels retain approximately 83 px minimum side margins at maximum camera scale. Platform-specific social-app overlays were not simulated.
- Pointly cursor tip `(660, 662)` is inside catalog target bounds `(40.8, 641.3, 818.4, 108)` in panel coordinates at frame 382.
- DoctorChart cursor tip `(792, 467)` is inside consultation target bounds `(61.6, 444.8, 802.8, 94.4)` at frame 686.
- Fictional names, records, dates, points balance and reward cost checked against the horizontal source. No new functionality or product data exchange introduced.
- Fonts and logos are copied local assets. Pointly's copied SVG retains its viewBox scaling correction; source frontend assets are untouched.
- Audio is absent, as in the horizontal source; no audio synchronization requirement applies.
- The horizontal project is unchanged: 19,210 files matched SHA-256, byte size, modification time and full file list, including dependencies and Git metadata. See `horizontal-integrity.json`.
- All three source frontend Git working trees are clean.
- No MP4 was created. QA output consists of PNGs and reports only.

Remaining manual review: creative approval of the complete portrait playback and checking the intended publishing platform's overlays before final export. There are no known technical blockers.
