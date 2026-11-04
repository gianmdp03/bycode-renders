from pathlib import Path
import json,secrets,subprocess,os
ROOT=Path(__file__).resolve().parents[1];LOCAL=ROOT/'.local'
app=LOCAL/'obs-app';config=app/'config/obs-studio'
config.mkdir(parents=True,exist_ok=True)
authfile=LOCAL/'obs-auth.json'
auth=json.loads(authfile.read_text()) if authfile.exists() else {'password':secrets.token_urlsafe(24),'port':25655}
authfile.write_text(json.dumps(auth))
ws=config/'plugin_config/obs-websocket';ws.mkdir(parents=True,exist_ok=True)
(ws/'config.json').write_text(json.dumps({'alerts_enabled':False,'auth_required':True,'debug_enabled':False,'first_load':False,'server_enabled':True,'server_password':auth['password'],'server_port':auth['port']}))
adapter=int(os.environ.get('TUTORIAL_OBS_ADAPTER','0'))
settings=f'[General]\nFirstRun=true\n[Basic]\nProfile=Tutorial\nProfileDir=Tutorial\nSceneCollection=Tutorial\nSceneCollectionFile=Tutorial\n[BasicWindow]\nSysTrayEnabled=true\nSysTrayWhenStarted=true\n[Video]\nAdapterIdx={adapter}\n'
(config/'global.ini').write_text(settings);(config/'user.ini').write_text(settings)
profile=config/'basic/profiles/Tutorial';profile.mkdir(parents=True,exist_ok=True)
recordings=str(ROOT/'recordings').replace('\\','/')
(profile/'basic.ini').write_text(f'''[General]
Name=Tutorial
[Video]
BaseCX=1920
BaseCY=1080
OutputCX=1920
OutputCY=1080
FPSType=0
FPSCommon=60
ColorFormat=NV12
ColorSpace=709
ColorRange=Partial
[Audio]
SampleRate=48000
ChannelSetup=Stereo
[Output]
Mode=Simple
FilenameFormatting=%CCYY-%MM-%DD_%hh-%mm-%ss
[SimpleOutput]
FilePath={recordings}
RecFormat2=mkv
RecQuality=HQ
RecEncoder={os.environ.get('TUTORIAL_OBS_ENCODER','nvenc')}
StreamEncoder=x264
VBitrate=18000
ABitrate=192
''')
scenes=config/'basic/scenes';scenes.mkdir(parents=True,exist_ok=True)
if not (scenes/'Tutorial.json').exists():
 (scenes/'Tutorial.json').write_text(json.dumps({'name':'Tutorial','current_scene':'Tutorial','current_program_scene':'Tutorial','scene_order':[{'name':'Tutorial'}],'sources':[{'name':'Tutorial','id':'scene','settings':{'items':[]},'mixers':0,'enabled':True,'muted':True,'volume':0}],'groups':[],'transitions':[],'quick_transitions':[],'saved_projectors':[]}))
(ROOT/'recordings').mkdir(exist_ok=True)
p=subprocess.Popen([str(app/'bin/64bit/obs64.exe'),'--portable','--multi','--profile','Tutorial','--collection','Tutorial','--minimize-to-tray','--disable-updater'],cwd=app/'bin/64bit',creationflags=subprocess.CREATE_NO_WINDOW)
(LOCAL/'obs-process.json').write_text(json.dumps({'pid':p.pid,'path':str(app),'config':str(config)}))
print('Isolated OBS launched. No desktop audio or microphone configured.')
