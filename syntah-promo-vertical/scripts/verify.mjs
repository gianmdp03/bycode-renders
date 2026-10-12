import assert from "node:assert/strict";
import fs from "node:fs/promises";
import path from "node:path";
import { bundle } from "@remotion/bundler";
import {
  getCompositions,
  openBrowser,
  renderFrames,
  renderStill,
} from "@remotion/renderer";

// All-frame runtime check, PNGs only. Never encodes a video.
const qa = path.resolve("qa");
await fs.mkdir(qa, { recursive: true });
const serveUrl = await bundle({
  entryPoint: path.resolve("src/index.ts"),
  rspack: true,
});
const browser = await openBrowser("chrome");
const errors = [];
const warnings = [];
const onBrowserLog = (log) => {
  if (log.type === "error") errors.push(log.text);
  if (log.type === "warning" || log.type === "warn") warnings.push(log.text);
};
try {
  const compositions = await getCompositions(serveUrl, {
    puppeteerInstance: browser,
    onBrowserLog,
  });
  const main = compositions.find((c) => c.id === "Syntah-Vertical");
  assert.ok(main);
  assert.deepEqual(
    [main.width, main.height, main.fps, main.durationInFrames],
    [1080, 1920, 60, 1440],
  );
  const sceneDurations = [180, 120, 300, 300, 240, 300];
  const sceneIds = [
    "Opening",
    "Products",
    "Pointly",
    "DoctorChart",
    "Ecosystem",
    "Closing",
  ];
  sceneIds.forEach((id, i) => {
    const scene = compositions.find((c) => c.id === id);
    assert.ok(scene, id);
    assert.equal(scene.durationInFrames, sceneDurations[i]);
    assert.equal(scene.fps, 60);
  });
  assert.equal(
    sceneDurations.reduce((a, b) => a + b, 0),
    main.durationInFrames,
  );
  const seen = new Set();
  await renderFrames({
    composition: main,
    serveUrl,
    puppeteerInstance: browser,
    outputDir: null,
    imageFormat: "none",
    inputProps: {},
    frameRange: [0, 1439],
    concurrency: 3,
    onBrowserLog,
    onStart: () => console.log("Checking all 1440 frames; no video encoding."),
    onFrameUpdate: (count, frame) => {
      seen.add(frame);
      if (count % 240 === 0) console.log(`Checked ${count}/1440 frames`);
    },
  });
  assert.equal(seen.size, 1440);
  const stills = [
    ["opening", 90],
    ["products", 240],
    ["pointly-before", 360],
    ["pointly-click", 382],
    ["pointly", 480],
    ["doctorchart-before", 660],
    ["doctorchart-click", 686],
    ["doctorchart", 780],
    ["pullback", 918],
    ["ecosystem", 1020],
    ["closing", 1320],
    ["last-frame", 1439],
  ];
  for (const [name, frame] of stills) {
    await renderStill({
      composition: main,
      serveUrl,
      // Use the CLI's fresh-browser path: reusing the all-frame check browser
      // can retain stale compositor layers in diagnostic PNGs on Windows.
      frame,
      imageFormat: "png",
      output: path.join(qa, `${name}.png`),
      onBrowserLog,
    });
    console.log(`Saved QA still: ${name} (${frame})`);
  }
  assert.deepEqual(errors, [], "Browser console errors");
  assert.deepEqual(warnings, [], "Browser/React warnings");
  const report = {
    compositionId: main.id,
    width: main.width,
    height: main.height,
    fps: main.fps,
    durationInFrames: main.durationInFrames,
    durationSeconds: main.durationInFrames / main.fps,
    verifiedFrames: seen.size,
    browserErrors: errors,
    browserWarnings: warnings,
    audio: "None - intentionally silent",
    encodedVideo: false,
    stills: stills.map(([name, frame]) => ({ name: `${name}.png`, frame })),
  };
  await fs.writeFile(
    path.join(qa, "verification.json"),
    JSON.stringify(report, null, 2),
  );
  console.log(JSON.stringify(report, null, 2));
} finally {
  await browser.close({ silent: true });
}
