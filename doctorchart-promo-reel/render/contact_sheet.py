from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
root=Path(__file__).resolve().parents[1]
frames=sorted((root/'out').glob('frame-*.png'))
w=270;h=480;label=32
sheet=Image.new('RGB',(w*4,(h+label)*3),'#DFE9E9')
font=ImageFont.truetype('C:/Windows/Fonts/arial.ttf',15)
for i,p in enumerate(frames[:12]):
    im=Image.open(p).convert('RGB').resize((w,h),Image.Resampling.LANCZOS)
    x=i%4*w;y=i//4*(h+label);sheet.paste(im,(x,y))
    ImageDraw.Draw(sheet).text((x+10,y+h+8),f'{int(p.stem.split("-")[-1])/60:.2f} s',font=font,fill='#173B50')
sheet.save(root/'out/contact-sheet-bycode-integrado.jpg',quality=95)
