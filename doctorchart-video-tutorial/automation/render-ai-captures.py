"""Fast native-60fps capture export; Remotion supplies decorations and zoom clips.

Speech is mixed separately at exact 800-sample frame offsets. Neither AI studio
state nor personal recordings are modified. Resume is tied to the snapshot hash.
"""
from pathlib import Path
from PIL import Image, ImageDraw, ImageFilter
import bisect
from concurrent.futures import ThreadPoolExecutor, as_completed
import hashlib
import json
import math
import subprocess
import sys
import time
import wave

ROOT = Path(__file__).resolve().parent.parent
DATA = json.loads((ROOT/'remotion/src/ai-timeline.json').read_text(encoding='utf-8'))
OLD = json.loads((ROOT/'remotion/src/timeline.json').read_text(encoding='utf-8'))
CACHE = ROOT/'.local/ai-render'
FF = next((ROOT/'.local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries').glob('*.exe'))
PROBE = ROOT/'remotion/node_modules/@remotion/compositor-win32-x64-msvc/ffprobe.exe'
ZOOMS = {'wizard-number','patient-demographics','encounter-measurements','rx-medication','studies-preview'}
for folder in ('clips','layers','rings','commands','filters','logs'):
    (CACHE/folder).mkdir(parents=True,exist_ok=True)


def probe(file):
    return json.loads(subprocess.check_output([str(PROBE),'-v','error','-show_streams','-show_format','-show_chapters','-show_data_hash','sha256','-of','json',str(file)]))


def check_clip(clip):
    file=CACHE/'clips'/f'{clip["id"]}.mp4'
    if not file.exists():
        return False
    try:
        stream=next(s for s in probe(file)['streams'] if s['codec_type']=='video')
        return (stream['width'],stream['height'],stream['r_frame_rate'],int(stream['nb_frames']))==(1920,1080,'60/1',clip['durationInFrames'])
    except (subprocess.CalledProcessError,KeyError,StopIteration):
        return False


def cursor_png():
    factor=4
    image=Image.new('RGBA',(30*factor,34*factor))
    points=[(x*.9*factor,y*.9*factor) for x,y in [(2,1),(23,15),(14,17),(10,27)]]
    shadow=Image.new('RGBA',image.size)
    ImageDraw.Draw(shadow).polygon([(x+.9*factor,y+1.8*factor) for x,y in points],fill=(0,0,0,102))
    image.alpha_composite(shadow.filter(ImageFilter.GaussianBlur(1.8*factor)))
    draw=ImageDraw.Draw(image)
    draw.polygon(points,fill='white')
    draw.line(points+[points[0]],fill='#153744',width=round(1.35*factor),joint='curve')
    image.resize((30,34),Image.Resampling.LANCZOS).save(CACHE/'cursor.png')


def render_capture(clip):
    if check_clip(clip):
        return clip['id'],'cached'
    scene=OLD['scenes'][clip['sceneIndex']]
    points=[p for p in scene['cursor'] if p.get('x') is not None and p.get('y') is not None and p['event'] in ('move','click')]
    frames=[p['frame'] for p in points]
    clicks=[p for p in points if p['event']=='click']
    positions=[]
    ages=[]
    for frame in range(clip['durationInFrames']):
        source_frame=clip['sourceStart']+min(clip['sourceFrames']-1,math.floor(frame*clip['visualSpeed']))
        index=max(0,bisect.bisect_right(frames,source_frame)-1)
        before=points[index] if points else dict(x=1700,y=900,frame=0)
        following=points[min(index+1,len(points)-1)] if points else before
        frac=max(0,min(1,(source_frame-before['frame'])/(following['frame']-before['frame']))) if following['frame']!=before['frame'] else 0
        positions.append(((before['x']+(following['x']-before['x'])*frac)*.9,(before['y']+(following['y']-before['y'])*frac)*.9))
        active=[p for p in clicks if p['frame']<=source_frame<p['frame']+18]
        ages.append(source_frame-active[-1]['frame'] if active else None)
    has_ring=any(a is not None for a in ages)
    ring_file=CACHE/'rings'/f'{clip["id"]}.mov'
    if has_ring:
        ring_command=[str(FF),'-v','error','-y','-f','rawvideo','-pixel_format','rgba','-video_size','90x90','-framerate','60','-i','pipe:0','-an','-c:v','qtrle',str(ring_file)]
        proc=subprocess.Popen(ring_command,stdin=subprocess.PIPE)
        blank=bytes(90*90*4)
        sprites={}
        for age in set(a for a in ages if a is not None):
            image=Image.new('RGBA',(360,360))
            r=20*(.6+age/18*1.1)*.9*4
            ImageDraw.Draw(image).ellipse((180-r,180-r,180+r,180+r),outline=(6,158,171,round(255*.5*(1-age/18))),width=7)
            sprites[age]=image.resize((90,90),Image.Resampling.LANCZOS).tobytes()
        for age in ages:
            proc.stdin.write(blank if age is None else sprites[age])
        proc.stdin.close()
        if proc.wait()!=0:
            raise RuntimeError('Ring animation failed')
    command_file=CACHE/'commands'/f'{clip["id"]}.txt'
    commands=[]
    for frame,(x,y) in enumerate(positions):
        targets=f'overlay@pointer x {x:.4f}, overlay@pointer y {y:.4f}'
        if has_ring:
            targets+=f', overlay@ring x {x-45:.4f}, overlay@ring y {y-45:.4f}'
        commands.append(f'{max(0,frame/60-0.0000001):.9f} {targets};')
    command_file.write_text('\n'.join(commands)+'\n',encoding='utf-8')
    overlay=Image.open(CACHE/'layers'/f'{clip["id"]}.png').convert('RGBA')
    caption=overlay.crop((288,987,1608,1071))
    caption_file=CACHE/'layers'/f'{clip["id"]}-caption.png'
    caption.save(caption_file)
    ImageDraw.Draw(overlay).rectangle((288,987,1607,1070),fill=(0,0,0,0))
    footer_file=CACHE/'layers'/f'{clip["id"]}-footer.png'
    overlay.save(footer_file)
    source=ROOT/'remotion/public'/scene['footage']
    args=[str(FF),'-hide_banner','-v','warning','-y','-threads','2','-ss',str(clip['sourceStart']/60),'-t',str(clip['sourceFrames']/60),'-i',str(source),'-i',str(CACHE/'cursor.png')]
    if has_ring:
        args+=['-i',str(ring_file)]
    footer_input=3 if has_ring else 2
    caption_input=footer_input+1
    args+=['-i',str(footer_file),'-i',str(caption_file)]
    # Commands use paths relative to cwd, avoiding Windows drive-colon escaping.
    cmd_path=command_file.relative_to(ROOT).as_posix()
    filters=[f"[0:v]setpts=(PTS-STARTPTS)/{clip['visualSpeed']},fps=60,trim=end_frame={clip['motionFrames']},tpad=stop_mode=clone:stop_duration={clip['durationInFrames']/60},trim=end_frame={clip['durationInFrames']},scale=1728:972:flags=lanczos:in_color_matrix=bt709,format=rgb24,setsar=1,sendcmd=f='{cmd_path}'[capture]",
             '[capture][1:v]overlay@pointer=x=0:y=0:format=rgb:eof_action=repeat[pointed]']
    if has_ring:
        filters.append('[pointed][2:v]overlay@ring=x=0:y=0:format=rgb:eof_action=pass[ui]')
    else:
        filters.append('[pointed]null[ui]')
    filters += ['[ui]pad=1920:1080:96:0:color=0xf7fafb,drawbox=x=0:y=972:w=1920:h=1:color=0xcedce0:t=fill[padded]',
                f'[padded][{footer_input}:v]overlay=0:0:format=rgb:eof_action=repeat[decorated]',
                f"[decorated][{caption_input}:v]overlay=288:987:format=rgb:eof_action=repeat:enable='lt(t,{clip['audioDurationMs']/1000})',scale=in_range=pc:out_range=tv:out_color_matrix=bt709,format=yuv420p[out]"]
    filter_file=CACHE/'filters'/f'{clip["id"]}.txt'
    filter_file.write_text(';\n'.join(filters),encoding='utf-8')
    output=CACHE/'clips'/f'{clip["id"]}.mp4'
    args+=['-filter_complex_threads','2','-filter_complex_script',str(filter_file),'-map','[out]','-an','-c:v','h264_nvenc','-profile:v','main','-preset','p4','-rc','vbr','-cq','18','-b:v','12M','-bf','2','-g','120','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-color_range','tv','-r','60','-frames:v',str(clip['durationInFrames']),'-video_track_timescale','90000','-movflags','+faststart',str(output)]
    with (CACHE/'logs'/f'{clip["id"]}.log').open('w',encoding='utf-8') as log:
        subprocess.run(args,cwd=ROOT,stdout=log,stderr=log,check=True)
    if not check_clip(clip):
        raise RuntimeError('Incorrect output frame count: '+clip['id'])
    return clip['id'],'rendered'


def mix_voice():
    output=CACHE/'narration.wav'
    position=0
    with wave.open(str(output),'wb') as out:
        out.setparams((2,2,48000,0,'NONE','not compressed'))
        for clip in DATA['clips']:
            source=ROOT/'remotion/public'/clip['audio']
            if hashlib.sha256(source.read_bytes()).hexdigest()!=clip['audioSha256']:
                raise ValueError('Snapshot audio changed: '+clip['id'])
            start=clip['fromFrame']*800
            if start<position:
                raise ValueError('Overlapping narration')
            out.writeframes(bytes((start-position)*4))
            with wave.open(str(source),'rb') as wav:
                out.writeframes(wav.readframes(wav.getnframes()))
            position=start+clip['audioSamples']
        out.writeframes(bytes((DATA['durationInFrames']*800-position)*4))
    return output


def assemble():
    missing=[c['id'] for c in DATA['clips'] if not check_clip(c)]
    if missing:
        raise RuntimeError('Missing/incomplete clips: '+','.join(missing))
    concat=CACHE/'concat.txt'
    concat.write_text(''.join("file 'clips/"+c['id']+".mp4'\n" for c in DATA['clips']),encoding='utf-8')
    audio=mix_voice()
    metadata=CACHE/'chapters.ffmetadata'
    def escape(value):
        return ''.join('\\'+c if c in '\\=;#\n' else c for c in value)
    metadata.write_text(';FFMETADATA1\n'+''.join(f'\n[CHAPTER]\nTIMEBASE=1/60\nSTART={c["fromFrame"]}\nEND={c["fromFrame"]+c["durationInFrames"]}\ntitle={escape(c["title"])}\n' for c in DATA['chapters']),encoding='utf-8')
    output=ROOT/'output/DoctorChart-Tutorial-Prueba-IA.mp4'
    # Normalize SPS/VUI across browser zooms and native capture clips in one encode.
    command=[str(FF),'-hide_banner','-v','warning','-y','-threads','4','-f','concat','-safe','0','-i',str(concat),'-i',str(audio),'-i',str(metadata),'-map','0:v:0','-map','1:a:0','-map_metadata','2','-map_chapters','2','-c:v','h264_nvenc','-profile:v','high','-preset','p4','-rc','vbr','-cq','18','-b:v','12M','-bf','2','-g','120','-pix_fmt','yuv420p','-colorspace','bt709','-color_primaries','bt709','-color_trc','bt709','-color_range','tv','-c:a','aac','-b:a','192k','-ar','48000','-ac','2','-t',str(DATA['durationInFrames']/60),'-r','60','-video_track_timescale','90000','-movflags','+faststart','-metadata','title=DoctorChart - Tutorial - Prueba IA','-metadata','comment=Test export; Qwen male narration; editable Remotion project', '-progress',str(CACHE/'assembly-progress.txt'),str(output)]
    print('ASSEMBLY_START',flush=True)
    with (CACHE/'logs/assembly.log').open('w',encoding='utf-8') as log:
        subprocess.run(command,cwd=ROOT,stdout=log,stderr=log,check=True)
    result=probe(output)
    (ROOT/'qa/ai-test-mp4-probe.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
    print('OUTPUT',output,flush=True)


if __name__=='__main__':
    snapshot=CACHE/'snapshot.json'
    if snapshot.exists() and json.loads(snapshot.read_text())['stateSha256']!=DATA['stateSha256']:
        raise RuntimeError('Cached export belongs to a different saved AI state')
    snapshot.write_text(json.dumps({'stateSha256':DATA['stateSha256']}),encoding='utf-8')
    if '--assemble' in sys.argv:
        assemble()
    else:
        cursor_png()
        clips=[c for c in DATA['clips'] if c['id'] not in ZOOMS]
        if '--tail' in sys.argv:
            clips=clips[100:]
        if '--sample' in sys.argv:
            clips=clips[:1]
        started=time.monotonic()
        with ThreadPoolExecutor(max_workers=1 if '--tail' in sys.argv else 2) as pool:
            pending=[pool.submit(render_capture,c) for c in clips]
            for i,future in enumerate(as_completed(pending),1):
                print('CAPTURE',i,len(clips),*future.result(),round(time.monotonic()-started,1),flush=True)
