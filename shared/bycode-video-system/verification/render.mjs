import assert from 'node:assert/strict';
import { mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { bundle } from '@remotion/bundler';
import { getCompositions, openBrowser, renderStill } from '@remotion/renderer';
import { VERSION } from 'remotion';
import { PNG } from 'pngjs';

const root = fileURLToPath(new URL('../', import.meta.url));
const qa = path.join(root, 'qa');
await mkdir(qa, { recursive: true });
const serveUrl = await bundle({ entryPoint: path.join(root, 'verification/Root.tsx') });
const browser = await openBrowser('chrome');
const warnings = [];
try {
  const compositions = await getCompositions(serveUrl, { puppeteerInstance: browser });
  const render = async (id, frame) => {
    const composition = compositions.find((item) => item.id === id);
    assert.ok(composition, `Missing composition ${id}`);
    assert.equal(composition.fps, id.startsWith('Tutorial')?30:60);
    assert.equal(composition.durationInFrames, id.startsWith('Tutorial')?600:60);
    const output = path.join(qa, `${id}-${frame}.png`);
    await renderStill({
      serveUrl, composition, frame, output, puppeteerInstance: browser,
      onBrowserLog: (log) => {
        if (['error', 'warning', 'warn'].includes(log.type)) warnings.push(log.text);
      },
    });
    const png = PNG.sync.read(await readFile(output));
    assert.equal(png.width, composition.width);
    assert.equal(png.height, composition.height);
    return png;
  };
  for (const format of ['Portrait', 'Landscape']) {
    const baseline = await render(`Legacy${format}`, 24);
    const adopted = await render(`Provider${format}`, 24);
    assert.deepEqual(adopted.data, baseline.data, `Provider changed legacy pixels: ${format}`);
    console.log(`Provider preserves legacy pixels: ${format}`);
  }
  for(const id of ['BycodeReuse','PointlyReuse'])await render(id,30);
  const lesson=await render('TutorialBare',300);
  const brandedLesson=await render('TutorialBranded',300);
  assert.deepEqual(lesson.data,brandedLesson.data,'Shared brand context changed educational presentation');
  for (const format of ['Portrait', 'Landscape']) {
    const before = await render(`Promo${format}`, 11);
    const start = await render(`Promo${format}`, 12);
    const visible = await render(`Promo${format}`, 24);
    const end = await render(`Promo${format}`, 59);
    assert.deepEqual(start.data, before.data, 'Reveal must start hidden at Sequence-local frame 0');
    assert.notDeepEqual(visible.data, start.data, 'Reveal did not appear at local frame 12');
    assert.deepEqual(end.data, visible.data, 'Reveal must remain stable after entrance');
    console.log(`Sequence-local reveal boundaries passed: ${format}`);
  }
  assert.deepEqual(warnings, [], 'Unexpected browser warnings/errors');
  await writeFile(path.join(qa, 'verification.json'), JSON.stringify({
    remotion: VERSION, passed: true,
    checks: ['legacy pixel equality portrait/landscape', 'sequence-local reveal boundaries', 'metadata', 'browser logs','Bycode and Pointly reuse','tutorial unchanged at 30fps/600frames'],
  }, null, 2));
  console.log(`Frame verification passed on Remotion ${VERSION}; evidence: ${qa}`);
} finally {
  await browser.close({ silent: true });
}
