from PIL import Image
import json,sys
im=Image.open(sys.argv[1]).convert('RGB')
rows=[]
for y in range(im.height):
 r,g,b=im.getpixel((960,y))
 if r>80 and g<30 and b>80 and abs(r-b)<20:rows.append(y)
if not rows:raise RuntimeError('No calibration marker in captured real window')
top=min(rows)
if im.width!=1920 or im.height-top<1080:raise RuntimeError('Native content cannot be captured at 1920x1080')
print(json.dumps({'sourceWidth':im.width,'sourceHeight':im.height,'cropTop':top,'cropBottom':im.height-top-1080,'cropLeft':0,'cropRight':0,'scaleX':1,'scaleY':1,'positionX':0,'positionY':0,'boundsType':'OBS_BOUNDS_NONE'}))
