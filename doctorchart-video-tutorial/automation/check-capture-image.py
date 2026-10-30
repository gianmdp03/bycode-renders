from PIL import Image,ImageStat
import json,sys
image=Image.open(sys.argv[1]).convert('RGB');stats=ImageStat.Stat(image)
report={'size':image.size,'mean':stats.mean,'stddev':stats.stddev}
if image.size!=(1920,1080) or max(stats.stddev)<1 or max(stats.mean)<4:raise RuntimeError('Native capture is blank or wrong size: '+json.dumps(report))
print(json.dumps(report))
