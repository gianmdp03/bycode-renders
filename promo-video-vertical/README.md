# Pointly vertical master

Independent editable React/Remotion project, redesigned for portrait viewing from the approved horizontal master. The horizontal project and Angular frontend remain unchanged.

**Composition:** `Pointly-Vertical-Master` · **1080×1920** · **9:16** · **native 60 FPS** · **3828 frames / 63.8 seconds**.

## Preview

```powershell
cd C:\Users\gcast\Desktop\Render\promo-video-vertical
npm.cmd run dev
```

Open http://localhost:3002/Pointly-Vertical-Master. Port 3002 keeps the horizontal Studio on port 3000 separate; port 3001 was already occupied. If the preview is already running, open the URL without starting another server.

## Render manually

From this project folder:

```powershell
npx.cmd remotion render src/index.ts Pointly-Vertical-Master out/pointly-promo-vertical-1080x1920-60fps.mp4 --codec=h264 --crf=18 --pixel-format=yuv420p --audio-codec=aac --audio-bitrate=192k
```

`npm.cmd run render` runs that same command. Output is `C:\Users\gcast\Desktop\Render\promo-video-vertical\out\pointly-promo-vertical-1080x1920-60fps.mp4`.

No MP4 was rendered by the agent. Check encoded playback and audio at your intended delivery volume after the manual render.

## Portrait layout and timeline

All ten scenes retain the horizontal master’s duration, narrative order, copy, action frames and demo ledger. Desktop screens are reconstructed as focused sections, customer views fill the portrait canvas, and controls/cards are reflowed rather than shrinking a 16:9 interface. Promotional headings sit above the product panels.

| Scene | Seconds | Frames (inclusive) | Portrait treatment |
|---|---|---|---|
| Promise | 0–3.2 | 0–191 | Large headline above purchase and reward cards |
| Business | 3.2–8.7 | 192–521 | Branch card, focused rules, stacked product/reward cards |
| QR registration | 8.7–15.2 | 522–911 | Large QR contracts above a rising registration phone |
| Purchase | 15.2–21.8 | 912–1307 | Tall purchase modal and large +100 result |
| Balance/catalog | 21.8–29.6 | 1308–1775 | Matched points card, stacked lookup and vertical catalog scroll |
| Redemption | 29.6–36.4 | 1776–2183 | Catalog continuity, merchant confirmation and zero balance |
| Tiers | 36.4–43.4 | 2184–2603 | Large progress card above stacked tier ladder |
| Promotion | 43.4–49.6 | 2604–2975 | Stacked configuration, shared tall 2x campaign card |
| Retention | 49.6–59.8 | 2976–3587 | Inactive customer, resolving variables, large WhatsApp draft |
| CTA | 59.8–63.8 | 3588–3827 | Centered logo/CTA with product cards above and below |

`src/data.ts` owns the timing and demo data. `src/Video.tsx` assembles ten independently editable scenes; all have standalone Studio compositions. `src/vertical.tsx` contains portrait frames, focused navigation, fields, cards and phone. `src/ui.tsx`, `src/theme.ts` and `src/motion.tsx` retain the shared Pointly design and motion primitives.

## Verification

```powershell
npm.cmd run lint
node scripts/verify-project.mjs
node scripts/verify-preservation.mjs
npx.cmd remotion versions
```

The preservation check expects the horizontal sibling project at `../promo-video`; rendering does not depend on that folder. All fonts, logo, QR and audio required to render are inside this project’s `public/` folder. For a clean dependency installation run `npm.cmd ci`.

All Remotion packages are pinned to 4.0.530. This preserves the working render queue; the previously investigated 4.0.531 CLI distribution had an empty queue module. No node_modules patch is required.

`npm.cmd run qa:stills` generates full-resolution PNGs and portrait contact sheets in `qa/vertical/`, never an MP4. `qa/technical-report.json` covers composition metadata, ledger, cue frames and audio levels. `qa/preservation-report.json` confirms source/data/audio continuity with the horizontal master.

## Data and audio

Café Aurora / Sucursal Centro; María García / DNI 40123456. The initial $1,000 purchase awards 100 points; coffee costs 100 and redemption leaves zero. Later awards 100, 100, 150, 150, 150 reach 650. Purchases 3 and 6 unlock Plata and Oro for subsequent purchases. The 25–27 September 2x promotion has no depicted purchase or multiplier stacking. Retention is 27 October, 33 days after the last purchase, with 650 points. WhatsApp is a prepared draft with an Open action, never an automatic send.

Original procedural music and SFX are copied byte-for-byte from the improved horizontal master. All 19 cues remain on the same frames; both stereo 48 kHz tracks last 63.8 seconds. Default gains are 0.55 music / 0.65 SFX, with a mixed peak of approximately −19.94 dBFS and no clipping. Root props can mute or adjust the mix. No voiceover or missing audio asset is required.

The QR uses the same intentional demo URL, `https://pointly.example/join/1`. Replace it with a real campaign destination only if it needs to work publicly.
