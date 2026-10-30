from pathlib import Path
import av
from PIL import Image
root=Path(__file__).resolve().parents[1]
wanted={0,55,170,255,400,565,680,825,970,1100,1330,1570}
with av.open(str(root/'out/reel_preview_sin_voz.mp4')) as c:
    for n,frame in enumerate(c.decode(video=0)):
        if n in wanted:
            frame.to_image().resize((540,960),Image.Resampling.LANCZOS).save(root/f'out/frame-{n:04}.png')
        if n>max(wanted):break
print('12 control frames extracted from delivered MP4.')
