from pathlib import Path
from PIL import Image,ImageDraw,ImageFont
ROOT=Path(__file__).resolve().parent/'assets';ROOT.mkdir(exist_ok=True)
im=Image.new('RGB',(1200,1550),'white');d=ImageDraw.Draw(im)
font=lambda size:ImageFont.truetype('C:/Windows/Fonts/arial.ttf',size)
d.rectangle((0,0,1200,220),fill='#103d4a')
d.text((80,65),'DOCUMENTO DEMO',font=font(64),fill='white')
d.text((80,270),'Datos ficticios de demostración',font=font(44),fill='#103d4a')
for y,line in enumerate(['Este archivo fue generado para el videotutorial.','No es un estudio médico ni contiene datos reales.','No utilizar para atención, diagnóstico o tratamiento.','Identidad: Persona DEMO 01 · Tutorial Ficticio','Archivo de prueba para carga, vista previa y descarga.']):
 d.text((80,390+y*90),line,font=font(30),fill='#334155')
d.rectangle((80,930,1120,1280),outline='#158a8a',width=4)
d.text((140,1020),'SIN VALIDEZ CLÍNICA',font=font(55),fill='#158a8a')
d.text((80,1410),'DoctorChart · entorno local de demostración',font=font(28),fill='#64748b')
im.save(ROOT/'documento-demo.png');im.save(ROOT/'documento-demo.pdf','PDF',resolution=144)
print('Synthetic attachment PNG/PDF created; no clinical images or real identities.')
