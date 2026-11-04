"""Adapt the existing, proven local audiovisual harness; never read product dotenv.
Only infrastructure/configuration changes: frontend business source stays identical.
The generated runtime is retained for independent review and regeneration.
"""
from pathlib import Path
ROOT=Path(__file__).resolve().parents[1]
for d in ['demo','inventory','script','recordings','audio','output','qa','remotion/src','remotion/public','automation']:
 (ROOT/d).mkdir(parents=True,exist_ok=True)
src=(ROOT.parent/'doctorchart-video-tutorial/demo/runtime.py').read_text(encoding='utf8')
src=src.replace('doctorchart-tutorial-demo','pointly-tutorial-demo').replace('doctorchart.tutorial.owner','pointly.tutorial.owner').replace('doctorchart-video-tutorial-20261029','pointly-video-tutorial-20261103').replace('DoctorChart Tutorial DEMO','Pointly Tutorial DEMO')
src=src.replace('24443','25443').replace('24202','25201').replace('24201','25201').replace('24200','25200').replace('2408','2508').replace('24999','25999').replace('tutorial_clinical_demo','tutorial_pointly_demo')
start=src.index(" envfile('backend',")
end=src.index(" envfile('gateway',",start)
src=src[:start]+''' envfile('backend',{**common,'HTTP_ADDR':'127.0.0.1:25083','DATABASE_URL':f'postgresql://tutorial_demo:{secret["db"]}@db:5432/tutorial_pointly_demo?sslmode=disable','GATEWAY_SHARED_SECRET':secret['gateway'],'SERVICES_BILLING_SHARED_SECRET':secret['billing'],'SERVICES_BILLING_URL':'http://127.0.0.1:25081','APP_FRONTEND_URL':'http://localhost:25201','SUPABASE_URL':ORIGIN,'SUPABASE_SERVICE_ROLE_KEY':service,'MAIL_SERVICE_URL':'http://127.0.0.1:25086','MAIL_SERVICE_API_KEY':secret['converter'],'JOBS_ENABLED':'false','MEDIA_STORAGE_TYPE':'local','MEDIA_STORAGE_DIR':'/demo/data/pointly','MEDIA_PUBLIC_BASE_URL':ORIGIN,'IMAGE_CONVERTER_URL':'http://127.0.0.1:25086','IMAGE_CONVERTER_API_KEY':secret['converter']})
'''+src[end:]
src=src.replace("'POINTLY_SERVICE_URL':'http://127.0.0.1:25999'","'POINTLY_SERVICE_URL':'http://127.0.0.1:25083'").replace("'DOCTORCHART_SERVICE_URL':'http://127.0.0.1:25083'","'DOCTORCHART_SERVICE_URL':'http://127.0.0.1:25999'")
src=src.replace("'APP_DOCTORCHART_API_KEY':secret['converter'],'APP_POINTLY_API_KEY':secrets.token_hex(32)","'APP_DOCTORCHART_API_KEY':secrets.token_hex(32),'APP_POINTLY_API_KEY':secret['converter']")
src=src.replace("'SERVICES_POINTLY_LIMITS_WEBHOOK_URL':'http://127.0.0.1:25999/disabled'","'SERVICES_POINTLY_LIMITS_WEBHOOK_URL':'http://127.0.0.1:25083/internal/webhooks/billing/limits-updated'").replace("'SERVICES_DOCTORCHART_LIMITS_WEBHOOK_URL':'http://127.0.0.1:25083/internal/webhooks/billing/limits-updated'","'SERVICES_DOCTORCHART_LIMITS_WEBHOOK_URL':'http://127.0.0.1:25999/disabled'")
src=src.replace("('backend','doctorchart-backend-go','./cmd/api')","('backend','pointly-backend-go','./cmd/pointly')").replace("source=REPOS/'doctorchart-frontend'","source=REPOS/'pointly-frontend'")
src=src.replace("shutil.ignore_patterns('.git','node_modules','.angular','dist','test-results','.env*','local.public.json','environment.local.generated.ts')","shutil.ignore_patterns('.git','node_modules','.angular','dist','test-results','.env*','local.public.json','environment.local.generated.ts')")
(ROOT/'demo/runtime.py').write_text(src,encoding='utf8')
print('Infrastructure harness prepared. No product source or existing data modified.')
