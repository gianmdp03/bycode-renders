"""Diagnostic layout from final rendered stills, not production artwork."""
from pathlib import Path
from PIL import Image,ImageDraw
root=Path(__file__).resolve().parents[1]
frames=[100,260,550,850,1160,1540]
sheet=Image.new('RGB',(810,1016),'#e6ebf2')
draw=ImageDraw.Draw(sheet)
for i,f in enumerate(frames):
    pic=Image.open(root/f'out/frame-{f:04}.png').convert('RGB').resize((270,480))
    x=(i%3)*270;y=(i//3)*508
    sheet.paste(pic,(x,y));draw.text((x+10,y+485),f'Frame {f} | {f/60:.2f} s',fill='#10284b')
sheet.save(root/'out/contact-sheet.jpg',quality=94)
