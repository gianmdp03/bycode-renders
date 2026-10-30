"""Snapshot selected AI takes into a separate, reproducible Remotion composition."""
import hashlib
import json
import math
from pathlib import Path
import shutil
import wave
from datetime import datetime, timezone
from PIL import ImageFont

ROOT = Path(__file__).resolve().parent.parent
STATE = ROOT / '.local/ai-narration-studio/state.json'
TIMELINE = ROOT / 'remotion/src/timeline.json'


def sha(data):
    return hashlib.sha256(data).hexdigest()


def write_json(path, data):
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + '\n', encoding='utf-8')


font = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 32)


def caption_lines(text):
    words = text.split()
    if font.getlength(' '.join(words)) <= 1320:
        return ' '.join(words)
    choices = []
    for i in range(1, len(words)):
        a, b = ' '.join(words[:i]), ' '.join(words[i:])
        widths = [font.getlength(a), font.getlength(b)]
        if max(widths) <= 1320:
            choices.append((abs(widths[0] - widths[1]), a + '\n' + b))
    if not choices:
        raise ValueError('Caption exceeds two lines: ' + text)
    return min(choices)[1]


state_bytes, timeline_bytes = STATE.read_bytes(), TIMELINE.read_bytes()
state, old = json.loads(state_bytes), json.loads(timeline_bytes)
if state['timelineSha256'] != sha(timeline_bytes):
    raise ValueError('AI studio belongs to a different source timeline')
public_audio = ROOT / 'remotion/public/audio-ai'
public_audio.mkdir(exist_ok=True)
clips, chapters, total = [], [], 0
for scene_index, scene in enumerate(old['scenes']):
    chapter_start = total
    chapter_clips = []
    for beat_index, beat in enumerate(scene['beats']):
        segment = state['segments'][beat['id']]
        take = next(t for t in segment['takes'] if t['id'] == segment['selectedTakeId'])
        if take.get('voice') != 'masculina' or not take.get('engine', '').startswith('Qwen3'):
            raise ValueError('Not a selected male Qwen take: ' + beat['id'])
        if take['recordedText'].strip() != segment['text'].strip():
            raise ValueError('Audio/script mismatch: ' + beat['id'])
        source_audio = ROOT / '.local/ai-narration-studio/audio' / take['file']
        audio_bytes = source_audio.read_bytes()
        digest = sha(audio_bytes)
        if digest != take['sha256']:
            raise ValueError('Audio hash mismatch: ' + beat['id'])
        with wave.open(str(source_audio), 'rb') as wav:
            if (wav.getframerate(), wav.getnchannels(), wav.getsampwidth()) != (48000, 2, 2):
                raise ValueError('Unexpected audio format: ' + beat['id'])
            audio_samples = wav.getnframes()
        seconds = audio_samples / 48000
        source_start = beat['sourceStart']
        source_end = (scene['beats'][beat_index + 1]['sourceStart']
                      if beat_index + 1 < len(scene['beats'])
                      else scene['sourceStart'] + scene['durationInFrames'])
        source_frames = source_end - source_start
        if source_frames < 1:
            raise ValueError('Invalid capture range: ' + beat['id'])
        speed = float(segment['speed'])
        if speed not in (1.5, 1.75, 2):
            raise ValueError('Unexpected visual speed')
        motion_frames = math.ceil(source_frames / speed)
        audio_frames = math.ceil(audio_samples / 800)
        # Keep speech at 1x. Hold the demonstrated result if explanation outlasts action.
        duration = max(motion_frames, audio_frames + 12)
        audio_name = f"{beat['id']}-{digest[:12]}.wav"
        target = public_audio / audio_name
        if not target.exists() or sha(target.read_bytes()) != digest:
            shutil.copyfile(source_audio, target)
        clip = dict(id=beat['id'], sceneIndex=scene_index, title=segment['title'],
                    text=segment['text'].strip(), captionText=caption_lines(segment['text']),
                    fromFrame=total, chapterFrom=total-chapter_start, durationInFrames=duration,
                    sourceStart=source_start, sourceEnd=source_end, sourceFrames=source_frames,
                    visualSpeed=speed, motionFrames=motion_frames,
                    holdFrames=duration-motion_frames, audio='audio-ai/' + audio_name,
                    audioSamples=audio_samples, audioDurationMs=seconds*1000,
                    selectedTakeId=take['id'], audioSha256=digest)
        chapter_clips.append(len(clips))
        clips.append(clip)
        total += duration
    chapters.append(dict(id=scene['id'], title=scene['title'], fromFrame=chapter_start,
                         durationInFrames=total-chapter_start, clips=chapter_clips))
if len(clips) != 144:
    raise ValueError('Expected all 144 fragments')
data = dict(width=1920, height=1080, fps=60, durationInFrames=total,
            purpose='test-export-awaiting-review', narrationPlaybackRate=1,
            compiledAt=datetime.now(timezone.utc).isoformat(),
            stateSha256=sha(state_bytes), sourceTimelineSha256=sha(timeline_bytes),
            captionAlignment='Full fragment cue, exact selected WAV boundaries; no word alignment',
            chapters=chapters, clips=clips)
write_json(ROOT / 'remotion/src/ai-timeline.json', data)

lines = ["// Generated AI snapshot. Each clip remains a separately editable JSX Sequence.",
         "import {AbsoluteFill,Composition,Folder,Sequence} from 'remotion';",
         "import {RetimedBeat} from './RetimedBeat';",
         "import data from './ai-timeline.json';"]
for i, chapter in enumerate(chapters):
    lines.append(f'export const AIChapter{i+1:02d}=()=> <AbsoluteFill>')
    for ci in chapter['clips']:
        clip = clips[ci]
        name = json.dumps(clip['title'], ensure_ascii=False)
        lines.append(f'<Sequence name={{{name}}} from={{{clip["chapterFrom"]}}} durationInFrames={{{clip["durationInFrames"]}}}><RetimedBeat clip={{data.clips[{ci}]}}/></Sequence>')
    lines.append('</AbsoluteFill>;')
lines.append('export const DoctorChartAI=()=> <AbsoluteFill>')
for i, chapter in enumerate(chapters):
    name = json.dumps(chapter['title'], ensure_ascii=False)
    lines.append(f'<Sequence name={{{name}}} from={{{chapter["fromFrame"]}}} durationInFrames={{{chapter["durationInFrames"]}}}><AIChapter{i+1:02d}/></Sequence>')
lines.append('</AbsoluteFill>;')
lines.append('export const AIChapterCompositions=()=> <Folder name="IA-masculina-capitulos">')
for i, chapter in enumerate(chapters):
    lines.append(f'<Composition id="IA-{chapter["id"]}" component={{AIChapter{i+1:02d}}} width={{1920}} height={{1080}} fps={{60}} durationInFrames={{{chapter["durationInFrames"]}}}/>')
lines.append('</Folder>;')
(ROOT / 'remotion/src/GeneratedAITimeline.tsx').write_text('\n'.join(lines) + '\n', encoding='utf-8')


def stamp(ms):
    ms = round(ms)
    return f'{ms//3600000:02}:{ms//60000%60:02}:{ms//1000%60:02},{ms%1000:03}'


srt = []
for i, clip in enumerate(clips):
    start = clip['fromFrame'] / 60 * 1000
    srt.append(f"{i+1}\n{stamp(start)} --> {stamp(start+clip['audioDurationMs'])}\n{clip['captionText']}\n")
(ROOT / 'subtitles/doctorchart-ia-es-419.srt').write_text('\n'.join(srt), encoding='utf-8')
chapter_text = []
for c in chapters:
    sec = c['fromFrame'] // 60
    chapter_text.append(f'{sec//60:02}:{sec%60:02} {c["title"]}')
(ROOT / 'output/DoctorChart-IA-capitulos.txt').write_text('\n'.join(chapter_text)+'\n', encoding='utf-8')
report = dict(status='PASS', fragments=len(clips), chapters=len(chapters),
              audioSeconds=sum(c['audioSamples']/48000 for c in clips),
              durationSeconds=total/60, holdSeconds=sum(c['holdFrames'] for c in clips)/60,
              audioPlaybackRate=1, sourceStateSha256=data['stateSha256'],
              sourceTimelineSha256=data['sourceTimelineSha256'],
              humanStudioReadOrWritten=False,
              captions='144 cues matching saved scripts; maximum two lines at Arial 32px')
write_json(ROOT / 'qa/ai-render-snapshot.json', report)
print(json.dumps(report, ensure_ascii=False, indent=2))
