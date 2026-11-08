"""Create a NEW, owned localhost-only stack. Never read existing dotenv/DBs.

All server binaries come from the unchanged local checkouts. Auth is GoTrue,
Billing is the real service, and every database starts empty in this project's
private volume. No payments, SMTP provider, cloud bucket or external auth.
"""
from pathlib import Path
import base64, datetime as dt, hashlib, hmac, json, os, secrets, shutil, ssl, subprocess, sys, time, urllib.request
from cryptography import x509
from cryptography.x509.oid import NameOID
from cryptography.hazmat.primitives import hashes, serialization
from cryptography.hazmat.primitives.asymmetric import ec, rsa
from cryptography.hazmat.primitives.asymmetric.utils import decode_dss_signature
import ipaddress

ROOT=Path(__file__).resolve().parents[1]
LOCAL=ROOT/'.local'
REPOS=ROOT.parent.parent
PROJECT='pointly-tutorial-demo'
LABEL='pointly.tutorial.owner'
OWNER='pointly-video-tutorial-20261103'
ORIGIN='https://localhost:25443'
def run(args, **kwargs):
 result=subprocess.run(args,stdout=subprocess.PIPE,stderr=subprocess.PIPE,**kwargs)
 if result.returncode:
  (LOCAL/'logs').mkdir(parents=True,exist_ok=True)
  (LOCAL/'logs/last-command.stderr').write_bytes(result.stderr)
  raise subprocess.CalledProcessError(result.returncode,args)
 return result.stdout
def write(p,v):
 p.parent.mkdir(parents=True,exist_ok=True)
 p.write_text(v if isinstance(v,str) else json.dumps(v,indent=2),encoding='utf-8')
def envfile(name,values):
 write(LOCAL/'env'/f'{name}.env','\n'.join(f'{k}={v}' for k,v in values.items())+'\n')
def jwt(secret,role):
 enc=lambda v:base64.urlsafe_b64encode(json.dumps(v,separators=(',',':')).encode()).decode().rstrip('=')
 payload=enc({'role':role,'iss':'supabase','iat':int(time.time()),'exp':int(time.time())+31536000})
 text=enc({'alg':'HS256','typ':'JWT'})+'.'+payload
 return text+'.'+base64.urlsafe_b64encode(hmac.new(secret.encode(),text.encode(),hashlib.sha256).digest()).decode().rstrip('=')
def jwt_es(jwk,role):
 enc=lambda v:base64.urlsafe_b64encode(json.dumps(v,separators=(',',':')).encode()).decode().rstrip('=')
 scalar=int.from_bytes(base64.urlsafe_b64decode(jwk['d']+'=='),'big')
 key=ec.derive_private_key(scalar,ec.SECP256R1())
 text=enc({'alg':'ES256','typ':'JWT','kid':jwk['kid']})+'.'+enc({'role':role,'iss':'supabase','iat':int(time.time()),'exp':int(time.time())+31536000})
 r,s=decode_dss_signature(key.sign(text.encode(),ec.ECDSA(hashes.SHA256())))
 return text+'.'+base64.urlsafe_b64encode(r.to_bytes(32,'big')+s.to_bytes(32,'big')).decode().rstrip('=')
def prepare():
 if (LOCAL/'ownership.json').exists():
  verify();print('Existing owned demo retained.');return
 # A previous folder without ownership is never adopted.
 if (LOCAL/'compose.json').exists():raise RuntimeError('Unowned compose exists; refusing adoption')
 LOCAL.mkdir(exist_ok=True)
 for d in ['env','bin','certs','logs','data']: (LOCAL/d).mkdir(exist_ok=True)
 secret={k:secrets.token_hex(32) for k in ['db','gateway','billing','jwt','converter']}
 ca=rsa.generate_private_key(public_exponent=65537,key_size=2048)
 name=x509.Name([x509.NameAttribute(NameOID.COMMON_NAME,'Pointly Tutorial DEMO local CA')])
 now=dt.datetime.now(dt.timezone.utc)
 cacert=x509.CertificateBuilder().subject_name(name).issuer_name(name).public_key(ca.public_key()).serial_number(x509.random_serial_number()).not_valid_before(now-dt.timedelta(days=1)).not_valid_after(now+dt.timedelta(days=90)).add_extension(x509.BasicConstraints(ca=True,path_length=0),critical=True).sign(ca,hashes.SHA256())
 key=rsa.generate_private_key(public_exponent=65537,key_size=2048)
 cert=x509.CertificateBuilder().subject_name(x509.Name([x509.NameAttribute(NameOID.COMMON_NAME,'localhost')])).issuer_name(name).public_key(key.public_key()).serial_number(x509.random_serial_number()).not_valid_before(now-dt.timedelta(days=1)).not_valid_after(now+dt.timedelta(days=90)).add_extension(x509.SubjectAlternativeName([x509.DNSName('localhost'),x509.IPAddress(ipaddress.ip_address('127.0.0.1'))]),critical=False).sign(ca,hashes.SHA256())
 (LOCAL/'certs/ca.pem').write_bytes(cacert.public_bytes(serialization.Encoding.PEM))
 (LOCAL/'certs/server.pem').write_bytes(cert.public_bytes(serialization.Encoding.PEM))
 (LOCAL/'certs/server.key').write_bytes(key.private_bytes(serialization.Encoding.PEM,serialization.PrivateFormat.PKCS8,serialization.NoEncryption()))
 signing=ec.generate_private_key(ec.SECP256R1()).private_numbers()
 b64=lambda n:base64.urlsafe_b64encode(n.to_bytes(32,'big')).decode().rstrip('=')
 jwk={'kty':'EC','crv':'P-256','kid':secrets.token_hex(12),'alg':'ES256','use':'sig','key_ops':['sign','verify'],'x':b64(signing.public_numbers.x),'y':b64(signing.public_numbers.y),'d':b64(signing.private_value),'ext':True}
 service=jwt_es(jwk,'service_role');anon=jwt_es(jwk,'anon')
 envfile('db',{'POSTGRES_USER':'tutorial_demo','POSTGRES_PASSWORD':secret['db'],'POSTGRES_DB':'postgres'})
 # This SQL runs only on the brand-new project-owned volume.
 write(LOCAL/'init.sql','CREATE DATABASE tutorial_auth_demo;\nCREATE DATABASE tutorial_billing_demo;\nCREATE DATABASE tutorial_pointly_demo;\n')
 envfile('auth',{'GOTRUE_API_HOST':'0.0.0.0','GOTRUE_API_PORT':'9999','API_EXTERNAL_URL':ORIGIN+'/auth/v1','GOTRUE_SITE_URL':'http://localhost:25201','GOTRUE_URI_ALLOW_LIST':'http://localhost:25201/**','GOTRUE_DB_DRIVER':'postgres','GOTRUE_DB_DATABASE_URL':f'postgresql://tutorial_demo:{secret["db"]}@db:5432/tutorial_auth_demo?sslmode=disable','GOTRUE_DB_NAMESPACE':'auth','GOTRUE_JWT_SECRET':secret['jwt'],'GOTRUE_JWT_KEYS':json.dumps([jwk],separators=(',',':')),'GOTRUE_JWT_ISSUER':ORIGIN+'/auth/v1','GOTRUE_JWT_AUD':'authenticated','GOTRUE_JWT_EXP':'7200','GOTRUE_JWT_ADMIN_ROLES':'service_role','GOTRUE_DISABLE_SIGNUP':'true','GOTRUE_EXTERNAL_EMAIL_ENABLED':'true','GOTRUE_MAILER_AUTOCONFIRM':'true'})
 common={'TZ':'America/Argentina/Buenos_Aires','SSL_CERT_FILE':'/demo/certs/ca.pem','MEDIA_PROVIDER':'local','MEDIA_ENVIRONMENT':'test'}
 envfile('billing',{**common,'SERVER_ADDRESS':'127.0.0.1','SERVER_PORT':'25081','BILLING_ENV':'test','DB_URL':'postgresql://db:5432/tutorial_billing_demo?sslmode=disable','DB_USERNAME':'tutorial_demo','DB_PASSWORD':secret['db'],'DB_SCHEMA':'public','SUPABASE_URL':ORIGIN,'SUPABASE_SERVICE_ROLE_KEY':service,'SUPABASE_JWT_ISSUER':ORIGIN+'/auth/v1','SUPABASE_JWT_AUDIENCE':'authenticated','SUPABASE_MODULES_METADATA_KEY':'app_modules','MERCADOPAGO_BASE_URL':'http://127.0.0.1:25999','MERCADOPAGO_ACCESS_TOKEN':secrets.token_hex(32),'MERCADOPAGO_WEBHOOK_SECRET':secrets.token_hex(32),'MERCADOPAGO_COLLECTOR_ID':'1','MERCADOPAGO_NOTIFICATION_URL':'http://localhost:25999/disabled','MERCADOPAGO_RETURN_URL':'http://localhost:25200/panel','MERCADOPAGO_SANDBOX':'true','SERVICES_BILLING_SHARED_SECRET':secret['billing'],'SERVICES_POINTLY_LIMITS_WEBHOOK_URL':'http://127.0.0.1:25083/internal/webhooks/billing/limits-updated','SERVICES_DOCTORCHART_LIMITS_WEBHOOK_URL':'http://127.0.0.1:25999/disabled','MEDIA_STORAGE_TYPE':'local','MEDIA_STORAGE_DIR':'/demo/data/billing','BILLING_STARTUP_ENABLED':'true','BILLING_CLEANUP_ENABLED':'false','ACCOUNT_RECOVERY_ENABLED':'false'})
 envfile('backend',{**common,'HTTP_ADDR':'127.0.0.1:25083','DATABASE_URL':f'postgresql://tutorial_demo:{secret["db"]}@db:5432/tutorial_pointly_demo?sslmode=disable','GATEWAY_SHARED_SECRET':secret['gateway'],'SERVICES_BILLING_SHARED_SECRET':secret['billing'],'SERVICES_BILLING_URL':'http://127.0.0.1:25081','APP_FRONTEND_URL':'http://localhost:25201','SUPABASE_URL':ORIGIN,'SUPABASE_SERVICE_ROLE_KEY':service,'MAIL_SERVICE_URL':'http://127.0.0.1:25086','MAIL_SERVICE_API_KEY':secret['converter'],'JOBS_ENABLED':'false','MEDIA_STORAGE_TYPE':'local','MEDIA_STORAGE_DIR':'/demo/data/pointly','MEDIA_PUBLIC_BASE_URL':ORIGIN,'IMAGE_CONVERTER_URL':'http://127.0.0.1:25086','IMAGE_CONVERTER_API_KEY':secret['converter']})
 envfile('gateway',{**common,'PORT':'25080','GATEWAY_SHARED_SECRET':secret['gateway'],'POINTLY_SERVICE_URL':'http://127.0.0.1:25083','BILLING_SERVICE_URL':'http://127.0.0.1:25081','DOCTORCHART_SERVICE_URL':'http://127.0.0.1:25999','SUPABASE_JWT_ISSUER':ORIGIN+'/auth/v1','SUPABASE_JWKS_URL':ORIGIN+'/auth/v1/.well-known/jwks.json','SUPABASE_JWT_AUDIENCE':'authenticated','CORS_ALLOWED_ORIGINS':'http://localhost:25201'})
 converter={}
 for line in (REPOS/'bycode-image-email-service-go/.env.example').read_text(encoding='utf8').splitlines():
  if line and not line.startswith('#') and '=' in line:
   k,v=line.split('=',1);converter[k]=v
 converter.update({'LISTEN_ADDR':'127.0.0.1:25086','MAIL_ENABLED':'false','APP_DOCTORCHART_API_KEY':secrets.token_hex(32),'APP_POINTLY_API_KEY':secret['converter'],'APP_BYCODE_API_KEY':secrets.token_hex(32)})
 envfile('converter',converter)
 write(LOCAL/'nginx.conf','''events {}\nhttp { server { listen 25443 ssl; server_name localhost;
ssl_certificate /demo/certs/server.pem; ssl_certificate_key /demo/certs/server.key;
client_max_body_size 12m;
location /auth/v1/ { proxy_pass http://auth:9999/; proxy_set_header Host $http_host; proxy_set_header X-Forwarded-Proto https;
proxy_hide_header Access-Control-Allow-Origin;
add_header Access-Control-Allow-Origin http://localhost:25201 always;
add_header Access-Control-Allow-Headers "authorization,apikey,content-type,x-client-info,x-supabase-api-version" always;
add_header Access-Control-Allow-Methods "GET,POST,PUT,DELETE,OPTIONS" always;
if ($request_method = OPTIONS) { return 204; }}
location /api/ { proxy_pass http://127.0.0.1:25080; proxy_read_timeout 180s; }
location = /healthz { return 200 "DEMO"; }
}}''')
 mount=str(LOCAL.resolve()).replace('\\','/')
 labels={LABEL:OWNER}
 services={
 'db':{'image':'postgres:17-alpine','env_file':['env/db.env'],'labels':labels,'volumes':['data:/var/lib/postgresql/data','./init.sql:/docker-entrypoint-initdb.d/01-demo.sql:ro'],'healthcheck':{'test':['CMD','pg_isready','-h','127.0.0.1','-U','tutorial_demo','-d','postgres'],'interval':'2s','timeout':'3s','retries':30}},
 'auth':{'image':'supabase/gotrue:v2.197.0','env_file':['env/auth.env'],'labels':labels,'depends_on':{'db':{'condition':'service_healthy'}}},
 'proxy':{'image':'nginx:stable-alpine','labels':labels,'networks':['default','browser-access'],'ports':['127.0.0.1:25443:25443'],'volumes':[mount+':/demo:ro','./nginx.conf:/etc/nginx/nginx.conf:ro'],'depends_on':['auth']}}
 for name in ['billing','backend','gateway','converter']:
  services[name]={'image':'golang:1.27.3','network_mode':'service:proxy','labels':labels,'env_file':['env/'+name+'.env'],'volumes':[mount+':/demo'],'working_dir':'/demo/bin','command':['/demo/bin/'+name],'depends_on':{'db':{'condition':'service_healthy'},'proxy':{'condition':'service_started'}}}
 write(LOCAL/'compose.json',{'name':PROJECT,'services':services,'volumes':{'data':{'labels':labels}},'networks':{'default':{'internal':True,'labels':labels},'browser-access':{'labels':labels}}})
 write(LOCAL/'auth-private.json',{'service_role':service,'anon':anon})
 write(LOCAL/'ownership.json',{'owner':OWNER,'project':PROJECT,'created_at':now.isoformat(),'resources':{},'hosts':['localhost','127.0.0.1'],'origin':ORIGIN,'databases':['tutorial_auth_demo','tutorial_billing_demo','tutorial_pointly_demo']})
 public={'publicSiteUrl':'http://localhost:25201','apiGatewayOrigin':ORIGIN,'applicationUrls':{'doctorchart':'http://localhost:25201','pointly':'http://localhost:25201','bycode':'http://localhost:25200'},'supabase':{'url':ORIGIN,'publishableKey':anon}}
 write(LOCAL/'frontend-public.json',public)
 print('Prepared NEW isolated demo descriptors; secrets stored only in ignored .local.')
def compose(*args):
 return run(['docker','compose','-p',PROJECT,'-f',str(LOCAL/'compose.json'),*args])
def verify():
 cfg=json.loads((LOCAL/'ownership.json').read_text(encoding='utf8'))
 if cfg['owner']!=OWNER or cfg['project']!=PROJECT or cfg['origin']!=ORIGIN or cfg['databases']!=['tutorial_auth_demo','tutorial_billing_demo','tutorial_pointly_demo']:raise RuntimeError('Demo identity mismatch')
 for name,ident in cfg['resources'].items():
  actual=json.loads(run(['docker','inspect',ident]))[0]
  if actual['Id']!=ident or actual['Config']['Labels'].get(LABEL)!=OWNER or actual['Config']['Labels'].get('com.docker.compose.project')!=PROJECT:raise RuntimeError('Container identity mismatch: '+name)
 return cfg
def build():
 prepare()
 projects=[('backend','pointly-backend-go','./cmd/pointly'),('billing','bycode-backend-go','./cmd/billing'),('gateway','api-ai-gateway-go','.'),('converter','bycode-image-email-service-go','./cmd/converter')]
 for name,repo,target in projects:
  print('Building unchanged source:',repo,flush=True)
  env=dict(os.environ,GOOS='linux',GOARCH='amd64',CGO_ENABLED='0')
  result=subprocess.run(['go','build','-tags','nodynamic','-trimpath','-o',str(LOCAL/'bin'/name),target],cwd=REPOS/repo,env=env,stdout=subprocess.PIPE,stderr=subprocess.PIPE)
  (LOCAL/'logs'/f'build-{name}.log').write_bytes(result.stdout+result.stderr)
  if result.returncode:raise RuntimeError('Build failed: '+repo+' (see ignored build log)')
 print('Four real service binaries built.')
def start():
 prepare();verify()
 for name in ['backend','billing','gateway','converter']:
  if not (LOCAL/'bin'/name).exists():raise RuntimeError('Run runtime.py build first')
 # New project only. Never use another compose path, project, or volume.
 compose('up','-d','db')
 db=compose('ps','-q','db').decode().strip()
 identity=json.loads(run(['docker','inspect',db]))[0]
 if identity['Config']['Labels'].get(LABEL)!=OWNER:raise RuntimeError('DB ownership mismatch')
 # Auth infrastructure schema is only prepared inside this newly owned DB.
 for attempt in range(60):
  try:
   run(['docker','exec',db,'psql','-U','tutorial_demo','-d','tutorial_auth_demo','-v','ON_ERROR_STOP=1','-c',"CREATE SCHEMA IF NOT EXISTS auth; ALTER DATABASE tutorial_auth_demo SET search_path=auth,public; DO $$ BEGIN IF NOT EXISTS(SELECT FROM pg_roles WHERE rolname='postgres') THEN CREATE ROLE postgres NOLOGIN; END IF; END $$;"])
   break
  except subprocess.CalledProcessError:
   if attempt==59:raise
   time.sleep(.5)
 compose('up','-d','auth')
 for attempt in range(60):
  if b'"Status":"running"' in run(['docker','inspect','--format','{{json .State}}',compose('ps','-a','-q','auth').decode().strip()]).replace(b' ',b''):
   # Readiness is tested via HTTPS after the proxy is up; tolerate startup work.
   break
  time.sleep(.5)
 compose('up','-d','proxy','billing','backend','gateway','converter')
 cfg=json.loads((LOCAL/'ownership.json').read_text(encoding='utf8'))
 cfg['resources']={s:run(['docker','inspect','--format','{{.Id}}',compose('ps','-a','-q',s).decode().strip()]).decode().strip() for s in ['db','auth','proxy','billing','backend','gateway','converter']}
 write(LOCAL/'ownership.json',cfg);verify()
 print('Owned demo started; private DB network; only 127.0.0.1:25443 published. All configured providers are local.')
def frontend():
 verify()
 source=REPOS/'pointly-frontend';target=LOCAL/'frontend'
 if not target.exists():
  shutil.copytree(source,target,ignore=shutil.ignore_patterns('.git','node_modules','.angular','dist','test-results','.env*','local.public.json','environment.local.generated.ts'))
  subprocess.run(['cmd','/d','/c','mklink','/J',str(target/'node_modules'),str(source/'node_modules')],check=True,stdout=subprocess.DEVNULL)
 write(target/'config/local.public.json',json.loads((LOCAL/'frontend-public.json').read_text(encoding='utf8')))
 write(LOCAL/'frontend-proxy.json',{'/api':{'target':ORIGIN,'secure':True,'changeOrigin':True}})
 print('Starting byte-identical frontend source copy with isolated PUBLIC configuration.',flush=True)
 with (LOCAL/'logs/frontend.log').open('wb') as log:
  childenv=dict(os.environ,NODE_EXTRA_CA_CERTS=str(LOCAL/'certs/ca.pem'))
  p=subprocess.Popen(['cmd','/d','/c','npm start -- --port 25201 --host localhost --proxy-config '+str(LOCAL/'frontend-proxy.json')],cwd=target,env=childenv,stdout=log,stderr=log,creationflags=subprocess.CREATE_NO_WINDOW)
 write(LOCAL/'frontend-process.json',{'pid':p.pid,'path':str(target)})
def clean():
 cfg=verify()
 # Data deletion requires explicit command and exact ownership. Retain volume.
 if '--owned-resources-only' not in sys.argv:raise RuntimeError('Specify --owned-resources-only; only this project is eligible')
 compose('stop');print('Owned containers stopped; DEMO databases retained. No wipe performed.')
if __name__=='__main__':
 actions={'prepare':prepare,'build':build,'start':start,'frontend':frontend,'verify':verify,'clean-demo':clean}
 try:actions[sys.argv[1]]()
 except Exception as e:
  print(type(e).__name__+': '+str(e) if not isinstance(e,subprocess.CalledProcessError) else 'Local command failed; stderr retained privately, no credentials printed.',file=sys.stderr);sys.exit(1)
