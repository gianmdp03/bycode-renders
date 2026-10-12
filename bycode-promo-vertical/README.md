# ByCode — vertical company promo

Separate portrait adaptation of the approved horizontal promo. The horizontal project and source frontends are not dependencies and were not modified.

## Composition

- ID: `ByCode-Vertical`
- Resolution: **1080 × 1920** (9:16)
- Frame rate: **60 FPS**, native frame-driven animation
- Duration: **24.000 seconds / 1440 frames**
- Audio: none, matching the horizontal version
- Website: https://bycode.com.ar

| Scene | Seconds | Frames (inclusive) |
| --- | --- | --- |
| ByCode introduction | 0–3 | 0–179 |
| Nuestros productos | 3–5 | 180–299 |
| Pointly | 5–10 | 300–599 |
| DoctorChart | 10–15 | 600–899 |
| Ecosystem | 15–19 | 900–1139 |
| Closing | 19–24 | 1140–1439 |

## Open Remotion Studio

Run in PowerShell:

```powershell
Set-Location -LiteralPath 'C:\Users\gcast\Documents\GitHub\bycode-renders\bycode-promo-vertical'
npm run dev
```

Studio uses http://localhost:3040/ByCode-Vertical. Dependencies are installed. On a fresh checkout, run `npm ci` first.

## Render manually

From the same project directory:

```powershell
npx remotion render src/index.ts ByCode-Vertical out/bycode-vertical.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p
```

No MP4 has been rendered by the agent. This command is provided for the owner to run.

## Portrait adaptation

Intro and closing use stacked logo, name and copy. Product discovery and ecosystem cards are stacked vertically. Product highlights use large focused interfaces beneath the product identity, preserving the balance-to-reward and patient-to-consultation interactions. Desktop navigation and secondary reward details are omitted for readability. The ecosystem uses purpose-built summary cards, rather than shrinking full desktop interfaces. Cursor paths and camera framing were recalculated for portrait.

Copy, story order, timing, fonts, colors, logos and fictional demo data remain consistent with the horizontal version. No cross-product data exchange or additional functionality is implied. Assets and fonts are local in `public/`.

## Verification

```powershell
npm run lint
npm run verify
```

`verify` evaluates all 1440 frames, checks composition metadata and scene timing, rejects browser errors and warnings, and saves PNG inspection frames in `qa/`. It does not encode video. The integrity script reads the horizontal sibling and compares its full file list, SHA-256 hashes, sizes and modification times against the baseline captured before portrait implementation. Never recapture that baseline.

See `qa/REVIEW.md`, `qa/verification.json`, and `qa/horizontal-integrity.json` for the handoff checks.

## Brand update

The active project now uses ByCode and bycode.com.ar. Existing files in qa/ and out/ are historical artifacts from before this update; they do not verify or show the current branding. The original horizontal integrity baseline is preserved as historical evidence and is no longer a gate for this intentional update to both formats.
