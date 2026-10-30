from pathlib import Path
import av,hashlib,json
root=Path(__file__).resolve().parents[1]
old=root/'archive/pre-brand-integration/reel_preview_sin_voz.mp4'
new=root/'out/reel_preview_bycode_integrado.mp4'
def digest(p):return hashlib.sha256(p.read_bytes()).hexdigest()
def decoded_audio(p):
    h=hashlib.sha256();samples=0
    with av.open(str(p)) as c:
        for f in c.decode(audio=0):h.update(f.to_ndarray().tobytes());samples+=f.samples
    return {'sha256':h.hexdigest(),'samples':samples}
def metadata(p):
    with av.open(str(p)) as c:
        v=c.streams.video[0];a=c.streams.audio[0]
        return {'width':v.width,'height':v.height,'fps':str(v.average_rate),'frames':v.frames,'sampleRate':a.sample_rate,'channels':a.channels}
before=decoded_audio(old);after=decoded_audio(new)
result={'status':'PASS','oldSha256':digest(old),'newSha256':digest(new),'originalStillPreserved':digest(old)==digest(root/'out/reel_preview_sin_voz.mp4'),'visualVersionChanged':digest(old)!=digest(new),'metadataPreserved':metadata(old)==metadata(new),'metadata':metadata(new),'decodedAudioIdentical':before==after,'audio':after}
assert result['originalStillPreserved'] and result['visualVersionChanged'] and result['metadataPreserved'] and result['decodedAudioIdentical'],result
(root/'qa/brand-integration-comparison.json').write_text(json.dumps(result,indent=2),encoding='utf-8')
print(json.dumps(result,indent=2))
