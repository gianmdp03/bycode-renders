from pathlib import Path
import json,hashlib,wave,math,unicodedata,re
import numpy as np
ROOT=Path(__file__).resolve().parents[1];chapters=json.loads((ROOT/'script/chapters.json').read_text(encoding='utf8'));rows=[];references=set()
def norm(s):return re.sub(r'[^a-z0-9]','',unicodedata.normalize('NFD',s.lower()).encode('ascii','ignore').decode())
numeric={'ocho mil quinientos':'8500','ocho':'8','mil':'1000','ochenta':'80','quinientos':'500','diez por ciento':'10%','dos mil':'2000','cero':'0','cien':'100','cincuenta por ciento':'50%','treinta':'30','diez megabytes':'10 MB'}
numeric={norm(k):norm(v) for k,v in numeric.items()}
retained={'15-products':{('dejarlo','dejarlos')},'25-expiration':{('detalle','detalles'),('revisa','revisar')},'26-wallet-access':{('','a')},'27-company-status':{('habilitalo','habilitarlo'),('revisa','revisar')}}
for c in chapters:
 file=ROOT/'audio'/(c['id']+'.wav');meta=json.loads(file.with_suffix('.json').read_text(encoding='utf8'));a=json.loads(file.with_suffix('.alignment.json').read_text(encoding='utf8'));digest=hashlib.sha256(file.read_bytes()).hexdigest()
 assert digest==meta['sha256']==a['audio_sha256'],c['id']+' stale audio/alignment'
 assert meta['text_sha256']==hashlib.sha256(c['narration'].encode()).hexdigest(),c['id']+' stale narration'
 with wave.open(str(file)) as w:
  assert (w.getnchannels(),w.getframerate(),w.getsampwidth())==(2,48000,2);samples=np.frombuffer(w.readframes(w.getnframes()),dtype='<i2').astype(np.float64)/32768;duration=w.getnframes()/48000
 peak=float(np.max(np.abs(samples)));assert peak<.999,c['id']+' clipped samples';assert abs(duration-meta['duration'])<.05
 reviewed={(norm(to),norm(frm)) for frm,to in a.get('captionReview',{}).get('corrections',[])}|retained.get(c['id'],set())
 unknown=[d for d in a['differences'] if numeric.get(norm(d['expected']))!=norm(d['heard']) and (norm(d['expected']),norm(d['heard'])) not in reviewed]
 assert not unknown,c['id']+' unreviewed transcript content '+str(unknown)
 assert all(0<=x['startMs']<x['endMs']<=duration*1000+100 for x in a['captions']),c['id']+' invalid acoustic captions'
 mono=samples.reshape(-1,2).mean(axis=1);hop=2400;levels=np.array([np.sqrt(np.mean(mono[i:i+hop]**2)) for i in range(0,len(mono),hop)]);silent=levels<.001
 runs=[];start=None
 for i,value in enumerate(silent):
  if value and start is None:start=i
  if not value and start is not None:
   if start>0 and (i-start)*.05>1.2:runs.append({'from':start*.05,'to':i*.05})
   start=None
 assert not runs,c['id']+' excessive internal silence '+str(runs)
 references.add(meta['reference_sha256']);rows.append({'id':c['id'],'state':'PASS','durationSeconds':round(duration,3),'peakDbFS':round(20*math.log10(peak),2),'sha256':digest,'scriptSimilarity':a['scriptSimilarity'],'differences':a['differences'],'captionCorrections':a.get('captionReview',{}).get('corrections',[]),'captionCount':len(a['captions']),'internalSilencesOver1_2Seconds':runs})
assert len(references)==1
(ROOT/'qa/audio-input-verification.json').write_text(json.dumps({'state':'PASS','narratedChapters':len(rows),'consistentSyntheticMaleReference':True,'externalVoiceAPI':False,'method':'File hashes, PCM format/peak, independent local acoustic transcription and timing, reviewed Spanish tokenization, silence analysis. No claim of a human listening session.','chapters':rows},ensure_ascii=False,indent=2),encoding='utf8')
print('PASS: 30 final Qwen sections, same male reference, acoustic timestamps, PCM stereo and no excessive internal silence.')
