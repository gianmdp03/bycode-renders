import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';
import { execFileSync } from 'node:child_process';
import { root } from './browser.mjs';
import { ffmpeg, ffprobe } from './recorder.mjs';
import { briefChapters } from '../script/brief-chapters.mjs';

const fps = 60;
const read = (file) => JSON.parse(fs.readFileSync(path.join(root, file), 'utf8'));
const write = (file, data) =>
  fs.writeFileSync(
    path.join(root, file),
    typeof data === 'string' ? data : JSON.stringify(data, null, 2) + '\n',
  );
const digest = (value) => crypto.createHash('sha256').update(value).digest('hex');
const normalize = (text) =>
  text
    .normalize('NFD')
    .replace(/\p{M}/gu, '')
    .toLowerCase()
    .replace(/[^a-z0-9]/g, '');
const stamp = (ms) => new Date(Math.round(ms)).toISOString().slice(11, 23).replace('.', ',');
const overrides = fs.existsSync(path.join(root, 'script/brief-edit-overrides.json'))
  ? read('script/brief-edit-overrides.json')
  : {};
const captures = read('recordings/brief-manifest.json').recordings;
const planOnly = process.argv.includes('--plan');
const prepareOnly = process.argv.includes('--prepare');
const output = path.join(root, 'remotion/public/footage');
fs.mkdirSync(output, { recursive: true });
fs.mkdirSync(path.join(root, 'remotion/public/audio'), { recursive: true });

function acousticFrame(words, phrases) {
  for (const phrase of [phrases].flat()) {
    const needle = normalize(phrase);
    for (let i = 0; i < words.length; i++) {
      let actual = '';
      for (let j = i; j < Math.min(words.length, i + 9); j++) {
        actual += normalize(words[j].display ?? words[j].word);
        if (actual === needle) return Math.round(words[i].start * fps);
        if (actual.length > needle.length) break;
      }
    }
  }
  throw Error('Missing acoustic anchor: ' + [phrases].join(' / '));
}

const storyboard = [],
  timeline = [],
  edits = [],
  cues = [];
let from = 0;
for (const chapter of briefChapters) {
  const id = chapter.id;
  const recording = captures.find((c) => c.scene_id === id);
  if (!recording && (planOnly || prepareOnly)) continue;
  if (!recording) throw Error('Missing real take: ' + id);
  const proof = read(`qa/${id}-evidence.json`);
  if (proof.source !== recording.file) throw Error('Stale capture evidence: ' + id);
  const audio = read(`audio/${id}.json`),
    alignment = read(`audio/${id}.alignment.json`);
  const wave = path.join(root, `audio/${id}.wav`);
  if (
    audio.text_sha256 !== digest(chapter.narration) ||
    audio.sha256 !== alignment.audio_sha256 ||
    audio.sha256 !== digest(fs.readFileSync(wave))
  ) {
    if (planOnly || prepareOnly) continue;
    throw Error('Stale narration or alignment: ' + id);
  }
  if (!alignment.captions.length) throw Error('No captions: ' + id);
  const sourceFrame = (ms) =>
    recording.sync.markerFrame + Math.round((ms - recording.sync.browserMs) * 0.06);
  const duration = Math.ceil((audio.duration + (id === 'b09-close' ? 1.3 : 0.8)) * fps);
  const custom = overrides[id] ?? {};
  const phases = proof.phases.map((p, i) => {
    const revision = custom[p.id] ?? {};
    const anchors = revision.voice ?? p.voice;
    const spoken = i === 0 ? 0 : acousticFrame(alignment.words, anchors);
    const start = Math.max(
      recording.source_start,
      sourceFrame(p.start) + Math.round((revision.trimStart ?? 0) * fps),
    );
    const end = Math.min(
      recording.source_end,
      sourceFrame(p.end) - Math.round((revision.trimEnd ?? 0) * fps),
    );
    if (end <= start) throw Error(`Empty source span: ${id}/${p.id}`);
    return {
      id: p.id,
      voice: anchors,
      from: i === 0 ? 0 : spoken + Math.round((revision.offset ?? 0) * fps),
      start,
      end,
    };
  });
  for (let i = 0; i < phases.length; i++) {
    const p = phases[i],
      span = (phases[i + 1]?.from ?? duration) - p.from;
    if (span <= 0) throw Error(`Non-increasing acoustic anchors: ${id}/${p.id}`);
    p.frames = span;
    p.speed = Math.max(1, (p.end - p.start) / span);
    p.hold = Math.max(0, span - (p.end - p.start));
  }
  console.log(
    'PLAN',
    id,
    (duration / fps).toFixed(2),
    's',
    phases.map((p) => `${p.id}:${p.speed.toFixed(2)}x`).join(' '),
  );
  if (planOnly) continue;
  const fingerprint = digest(JSON.stringify([recording.file, audio.sha256, phases])).slice(0, 12);
  const name = `${id}-${fingerprint}.mp4`,
    target = path.join(output, name);
  if (!fs.existsSync(target)) {
    const filter = phases.map(
      (p, i) =>
        `[v${i}]trim=start_frame=${p.start}:end_frame=${p.end},setpts=(PTS-STARTPTS)/${p.speed},fps=60,tpad=stop_mode=clone:stop=${p.frames},trim=end_frame=${p.frames},setpts=PTS-STARTPTS[s${i}]`,
    );
    const graph = `[0:v]split=${phases.length}${phases.map((_, i) => `[v${i}]`).join('')};${filter.join(';')};${phases.map((_, i) => `[s${i}]`).join('')}concat=n=${phases.length}:v=1:a=0[out]`;
    execFileSync(
      ffmpeg,
      [
        '-v',
        'error',
        '-y',
        '-i',
        path.join(root, recording.file),
        '-filter_complex',
        graph,
        '-map',
        '[out]',
        '-an',
        '-r',
        '60',
        '-c:v',
        'h264_nvenc',
        '-preset',
        'p4',
        '-cq',
        '17',
        '-b:v',
        '16M',
        '-pix_fmt',
        'yuv420p',
        target,
      ],
      { stdio: 'pipe' },
    );
  }
  const probe = JSON.parse(
    execFileSync(ffprobe, ['-v', 'quiet', '-show_streams', '-of', 'json', target], {
      encoding: 'utf8',
    }),
  ).streams[0];
  if (
    Number(probe.nb_frames) !== duration ||
    probe.width !== 1920 ||
    probe.height !== 1080 ||
    probe.avg_frame_rate !== '60/1'
  )
    throw Error('Unexpected edit dimensions/timing: ' + id);
  const audioFile = `audio/${id}.wav`;
  fs.copyFileSync(wave, path.join(root, 'remotion/public', audioFile));
  const opening = id === 'b01-intro',
    closing = id === 'b09-close';
  const scene = {
    ...chapter,
    edition: 'brief',
    from,
    durationInFrames: duration,
    sourceStart: 0,
    sourceFrames: duration,
    footage: 'footage/' + name,
    audio: audioFile,
    captions: alignment.captions,
    opening,
    closing,
  };
  if (id === 'b04-sale')
    scene.zoom = {
      x: 0.78,
      y: 0.96,
      amount: 0.055,
      start: phases.find((p) => p.id === 'estimate').from,
      end: phases.find((p) => p.id === 'detail').from,
    };
  timeline.push(scene);
  edits.push({
    id,
    recording: recording.file,
    edited: scene.footage,
    audioSha256: audio.sha256,
    phases,
  });
  storyboard.push({
    id,
    title: chapter.title,
    fromSeconds: from / fps,
    durationSeconds: duration / fps,
    objective: chapter.objective,
    narration: chapter.narration,
    recording: recording.file,
    phases,
    evidence: proof.evidence,
  });
  for (const cap of alignment.captions)
    cues.push({
      ...cap,
      startMs: cap.startMs + (from / 60) * 1000,
      endMs: cap.endMs + (from / 60) * 1000,
    });
  from += duration;
  console.log('COMPILED', id);
}
if (planOnly || prepareOnly) process.exit(0);
if (from / fps > 360) throw Error('Brief edition exceeded six minutes');
write('remotion/src/brief-timeline.json', {
  fps,
  width: 1920,
  height: 1080,
  durationInFrames: from,
  chapters: timeline,
});
write('recordings/brief-edit-manifest.json', { fps, chapters: edits });
write('script/storyboard-breve.json', storyboard);
write(
  'script/pointly-recorrido-breve.srt',
  cues.map((c, i) => `${i + 1}\n${stamp(c.startMs)} --> ${stamp(c.endMs)}\n${c.text}\n`).join('\n'),
);
write(
  'script/guion-breve.md',
  '# Pointly · recorrido breve\n\n' +
    storyboard
      .map(
        (c) =>
          `## ${c.title}\n\n${stamp(c.fromSeconds * 1000).slice(0, 8)} · ${c.durationSeconds.toFixed(1)} s\n\n${c.objective}.\n\n${c.narration}\n\n${c.evidence.map((e) => '- ' + e.label).join('\n')}\n`,
      )
      .join('\n'),
);
write(
  'script/capitulos-breve.txt',
  timeline.map((c) => `${stamp((c.from / fps) * 1000).slice(3, 8)} ${c.title}`).join('\n') + '\n',
);
console.log('BRIEF EDIT', (from / fps).toFixed(2), 'seconds');
