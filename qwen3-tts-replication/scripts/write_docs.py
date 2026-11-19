"""Build the self-contained Spanish handoff from audited facts."""
from pathlib import Path
import json,hashlib,zipfile
ROOT=Path(__file__).resolve().parents[1]
docs={
'README.md':'''# Narración y subtítulos Bycode · réplica auditada

Auditoría del 4 de noviembre de 2026. Leer INSTALLATION_REPORT.md y luego INSTALL_WINDOWS.md. El compañero debe pegar PROMPT_FOR_CODEX.md en su Codex, con esta carpeta extraída accesible. No necesita el repositorio original.

Se incluye la referencia masculina sintética imprescindible, el wheel Qwen verificado contra TODO el código Python instalado, locks de dependencias reales, manifiestos SHA-256 de pesos, scripts portables, biblioteca visual compilada y su procedencia, fuente local con OFL, WAV nuevo, JSON por palabra, SRT y dos clips Remotion.

Los pesos no están incluidos. scripts/models.py descarga únicamente los archivos de las revisiones inmutables auditadas y exige todos sus hashes. Internet se necesita para instalar y descargar; generación y transcripción posteriores son locales.

Prueba entregada: demo/public/reference.wav, reference.generation.json, alignment.json, words.json, phrases.json, reference.srt, qa.json y renders-final/{tutorial,reel}.mp4. Las carpetas renders y renders-reviewed conservan las iteraciones de QA; usar renders-final para revisión.

No hay grabaciones personales, credenciales ni música de terceros. La referencia incluida fue identificada como sintética y comprobada contra el perfil utilizado. La marca continúa draft. La aprobación perceptual de voz/pronunciación es humana; no se declara cumplida por aprobar checks técnicos.
''',
'INSTALLATION_REPORT.md':'''# Auditoría real de la instalación

## Hallazgo central y alcance de la evidencia

Raíz auditada: C:/Users/gcast/Documents/GitHub/bycode-renders. Commit observado: 32481eac8ba54b8c84f35d83e81d30b1afd5b380. Se trabajó en la rama actual. Al comenzar existían bycode-promo-horizontal/ y promo-video/ sin seguimiento; se preservaron. No se instalaron ni actualizaron paquetes en los entornos existentes. Las únicas escrituras de esta tarea se limitan a qwen3-tts-replication.

La producción real está demostrada por scripts, manifiestos de tomas, reportes y una generación nueva. No había procesos Python ni lotes Qwen activos al comenzar; se comprobó la GPU antes de generar. No se infiere la instalación de un tutorial estándar. Búsqueda dirigida en el repo, Documents, Downloads, C:/tmp, caché HF y procesos: no se identificó otra instalación activa de Qwen utilizada por estas producciones. Esto no equivale a una búsqueda forense de cada disco o usuario.

## Directorios y origen

- Motor: doctorchart-video-tutorial/.local/qwen-venv/Lib/site-packages/qwen_tts, paquete qwen-tts 0.1.1 de PyPI. No es checkout editable: no hay direct_url.json ni commit Git del paquete recuperable. TODOS los .py instalados coinciden con el wheel incluido (evidence/qwen-wheel-verification.json y qwen-code-hashes.json). No inventar un commit a partir del número de versión.
- Origen declarado por METADATA: https://github.com/Qwen/Qwen3-TTS; upstream oficial también accesible en https://github.com/QwenLM/Qwen3-TTS. Verificación web de fuentes primarias realizada el día de la auditoría; no se usa main para instalar.
- Python Qwen: doctorchart-video-tutorial/.local/qwen-venv/Scripts/python.exe.
- Python base de los venv: C:/Users/gcast/.cache/codex-runtimes/codex-primary-runtime/dependencies/python/python.exe, CPython 3.12.14 x64. No es Conda. qwen-venv fue creado desde voice-venv; pyvenv.cfg y sys.base_prefix coinciden con ese runtime.
- Base 0.6B: doctorchart-video-tutorial/.local/qwen/base-model. VoiceDesign 1.7B histórico: .local/qwen/model. Este último creó la referencia; NO se necesita para seguir usando esa voz.
- Referencia estable: doctorchart-video-tutorial/.local/qwen/voice-library/doctorchart-masculina-01/reference.wav. La copia histórica qa/qwen-voz-masculina.wav es idéntica por hash.
- ASR: doctorchart-promo-reel/.local/voice-venv/Scripts/python.exe; modelo doctorchart-promo-reel/.local/whisper-small. También existe snapshot HF global models--Systran--faster-whisper-small/snapshots/536b0662742c02347bc0e980a01041f333bce120 bajo C:/Users/gcast/.cache/huggingface/hub.
- FFmpeg narración: doctorchart-video-tutorial/.local/voice-venv/Lib/site-packages/imageio_ffmpeg/binaries/ffmpeg-win-x86_64-v7.1.exe. ffprobe y compositor de exportación: node_modules/@remotion/compositor-win32-x64-msvc. No hay ffmpeg global en PATH observado.

## Consumidores comprobados

DoctorChart tutorial usa automation/qwen-worker.py con qwen-client.mjs, ai-batch.mjs y ai-narration-studio.mjs. Es un trabajador residente con JSON por stdin, progreso y guardado de tomas. Estudio IA configurado en puerto 3320; el estudio personal 3310 NO aporta referencias. Los puertos son configuración histórica, no servidores comprobados activos hoy.

Pointly tutorial usa automation/narrate.py: carga Base/prompt una vez por lote y guarda cada capítulo; automation/align.py transcribe audio definitivo. Bycode institucional usa scripts/qwen.mjs → qwen-generate.py → qwen-splice.py → qwen-align.py → render y QA. Pointly reel usa scripts/voice.mjs y align-mix.py. DoctorChart reel usa render/qwen.py. Todos reutilizan Base y la referencia masculina comprobada. No se ejecutaron estos comandos completos porque escribirían en las producciones originales.

Comandos REALES documentados: npm run voice:qwen --workspace=bycode-institucional-reel y npm run voice:qwen --workspace=pointly-promo-reel. No son comandos de réplica autónoma; sus equivalentes portables están en scripts/generate.py y test.ps1. Copias de scripts relevantes con hashes en evidence/source/.

## Hardware y ejecución

Windows 11 Home 10.0.26300, x64; Intel Core i5-13420H; 51.150.786.560 bytes RAM (~47,64 GiB). NVIDIA GeForce RTX 4050 Laptop GPU, 6141 MiB VRAM. Driver observado 621.01. nvidia-smi anuncia compatibilidad CUDA UMD 13.5; torch.version.cuda confirma runtime 12.8. NO son la misma versión y no se requiere instalar un toolkit CUDA 13.5 para replicar Torch cu128. Node v26.13.0; uv 0.13.0 disponible, no requerido para inferencia.

## Variables y cachés

Los generadores fuerzan HF_HUB_OFFLINE=1, HF_HUB_DISABLE_IMPLICIT_TOKEN=1, HF_HUB_DISABLE_TELEMETRY=1 y TOKENIZERS_PARALLELISM=false. Son variables por proceso, no cambios de configuración global. scripts/models.py usa URLs públicas con revisión fija sin tokens. REEL_FFMPEG/REEL_FFPROBE los suministran los launchers reales; REEL_ASR_MODEL permite override en algunos flujos. evidence/host-tools.json conserva sólo una lista permitida de variables, nunca tokens ni el entorno completo. Las cachés de modelos no se empaquetan; tampoco se copian cachés pip, credenciales HF, .env ni estados de estudios.

## Evidencia y límites

models-manifest.json contiene tamaños y SHA-256 calculados AHORA de todos los archivos de ambos modelos requeridos y del VoiceDesign histórico. Las revisiones Base y VoiceDesign se contrastan con documentos de procedencia; Whisper se identifica por los cuatro .metadata de descarga locales y el snapshot global. No se regeneró la referencia ni se asumió un speaker predefinido.

La prueba local completa está en SUBTITLES_VERIFY.md. No se ha instalado el paquete en la computadora del compañero; las diferencias de hardware y la disponibilidad futura de artefactos exactos se verifican allí. Si falta una versión, detenerse: no actualizar silenciosamente.
''',
'MODEL_AND_VOICE.md':'''# Modelo y voz exactos

Modelo de generación: Qwen/Qwen3-TTS-12Hz-0.6B-Base, tamaño comercial 0.6B (config tts_model_size=0b6, tts_model_type=base, tokenizer_12hz). Revisión: 5d83992436eae1d760afd27aff78a71d676296fc. Pesos raíz 1.829.344.272 bytes más speech_tokenizer/model.safetensors 682.293.092 bytes. Hashes de TODOS los archivos en models-manifest.json. Se descarga también el speech tokenizer de ESA revisión, sin reemplazarlo con otro modelo.

La identidad es doctorchart-masculina-01, una voz sintética propia. NO tiene speaker ID de CustomVoice y no es Ryan ni otra voz masculina de catálogo. Se construye con create_voice_clone_prompt(ref_audio=reference.wav, ref_text=profile.reference_spoken_text, x_vector_only_mode=False), modo ICL. El prompt se mantiene residente. El WAV y su transcripción literal son imprescindibles; no se puede reconstruir la misma identidad sólo con un prompt descriptivo.

Referencia SHA-256: 37511600572dd075c64568c80ed829a0a7d35a38a4597f398579b548a1a730f9. 25,84 s, 48 kHz estéreo. voice/reference-metadata.json demuestra su generación sintética y user_voice_reference=null. La copia está autorizada por este pedido de replicar esa voz sintética; no se extrajeron audios personales. Perfil autónomo en voice/profile.json.

Origen de referencia: Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign, revisión 5ecdb67327fd37bb2e042aab12ff7391903235d3, seed 20261030. Instrucción literal en profile.voice_design_instruction y reference-metadata.json: varón latinoamericano treintañero, acento argentino, tono cálido y conversacional. Esa instrucción creó el WAV histórico; NO se vuelve a pasar como instruct a generate_voice_clone.

## Parámetros efectivos comprobados

CUDA:0, torch.bfloat16, SDPA, Torch threads=1 e interop=1. language='Spanish', non_streaming_mode=True. temperature=0.9, top_p=1.0, top_k=50, do_sample=True, repetition_penalty=1.05; subtalker_dosample=True, subtalker_temperature=0.9, subtalker_top_p=1.0, subtalker_top_k=50. Son valores de generation_config.json que _merge_generate_kwargs usa en la versión instalada, NO parámetros adivinados. Seed se establece tanto en torch.manual_seed como en torch.cuda.manual_seed_all.

Modelo devuelve 24.000 Hz en la prueba. Worker y tutorial normalizan con loudnorm=I=-16:TP=-1.5:LRA=7 y exportan PCM16 estéreo 48 kHz; sin acelerar voz ni cambiar pitch. Reels guardan primero PCM16 nativo y luego recortan silencio exterior, normalizan/mezclan. No se presenta esta diferencia de cuantización/recorte como idéntico posprocesamiento. El adaptador de prueba usa el generador del institucional y el posprocesamiento comprobado del worker, expresamente documentado.

## Variantes REALES: no existe un único seed/alias universal

| Flujo | Texto hablado | Seed | Límite |
|---|---|---|---|
| Perfil vigente / institucional | Bycode → báicod; DoctorChart → Doctor Chart | 20261030 + índice de toma; overrides por ID | min(2048,max(384,palabras*12)) |
| Pointly reel | Bycode → baicod, override local sin acento | 20261030 + índice; overrides por ID | mismo |
| DoctorChart worker histórico | Bycode/bycode → baicode | 20261030 | min(2048,max(384,palabras*9)) |
| Pointly tutorial existente | Bycode → baicode, Pointly → Pointli, aliases de siglas en script | 20261103 | min(2048,max(512,palabras*12)) |

El handoff recomienda báicod, pero narrate.py de Pointly todavía implementa baicode. Se informa el desacuerdo sin corregir el original. scripts/generate.py ofrece bycode-current (default, perfil vigente), pointly-tutorial y doctorchart-worker. Cada reporte registra el texto realmente enviado. Estas opciones reflejan flujos existentes; no cambian la identidad de voz ni ofrecen modelos alternativos. Los overrides de seeds de reels y cortes editoriales se consultan en sus manifiestos, no se trasladan a una narración nueva sin motivo.

Prueba solicitada: test-text.json conserva el texto escrito literal. Hablado: «Bienvenidos a báicod Software. En este tutorial vamos a aprender a utilizar Pointly de forma sencilla y rápida.» Seed 20261030, max_new_tokens=384. Configuración efectiva, GPU y resultados en demo/public/reference.generation.json. Se restaura la escritura Bycode/Pointly en captions sólo sobre palabras reconocidas y con aliases explícitos.
''',
'DEPENDENCIES.md':'''# Dependencias reales y versiones

CPython 3.12.14 AMD64. Hay entornos SEPARADOS: no fusionarlos, porque numpy/tokenizers/HF difieren. Las listas completas actuales se extraen por importlib.metadata, no de requirements históricos. Ver evidence/*-environment.json y *-requirements.lock.txt. pip check pasó en Qwen y ASR existentes.

| Sistema | Versiones principales verificadas |
|---|---|
| Qwen | qwen-tts 0.1.1; torch y torchaudio 2.9.1+cu128; Transformers 4.57.3; tokenizers 0.22.2; accelerate 1.12.0; numpy 2.5.4; soundfile 0.14.0 |
| ASR | faster-whisper 1.2.1; CTranslate2 4.8.4; PyAV 19.0.2; tokenizers 0.23.3; huggingface_hub 2.4.0; numpy 2.4.2 |
| Audio | imageio-ffmpeg 0.6.0, ejecutable FFmpeg 7.1 (no se necesita FFmpeg global) |
| Video | Node 26.13.0; React/react-dom 19.2.3; Remotion, cli, bundler, renderer y captions 4.0.539; @bycode/video-system 0.1.0 compilado del repo auditado |
| GPU host | RTX 4050 Laptop 6141 MiB; driver 621.01; runtime Torch CUDA 12.8 |

Núcleo de narración: Qwen, Torch/torchaudio, Transformers/tokenizers, accelerate, soundfile y sus dependencias importadas (incluye librosa/soxr, NumPy, scipy y codecs/tokenizador). FFmpeg interviene en normalización y remuestreo. El paquete Qwen declara además Gradio, sox y otros imports; se conserva el entorno completo comprobado para evitar podas especulativas. Gradio/FastAPI/Uvicorn no se usan como servidor en la prueba CLI; Pillow se usa en tareas de QA/visual y está instalado. No todos los paquetes del lock son requisitos conceptuales de inferencia.

ASR usa CTranslate2 CPU int8, NO PyTorch ni CUDA. No se necesita WhisperX, stable-ts ni un alineador fonético adicional. PyAV está instalado; se pasa PCM mono float32 de 16 kHz al ASR para preservar el workaround real ante metadata_errors de la versión instalada.

No hay FlashAttention instalado; SDPA funciona. Falta SoX ejecutable en PATH y el import imprime advertencia; el flujo probado no lo invoca y funciona con FFmpeg. No instalar paquetes extra sólo para silenciar estos avisos.

Los locks guardan el entorno completo, no hashes de todos los wheels. El wheel Qwen sí se adjunta con SHA-256 y se comparó contra todas las fuentes instaladas. models-manifest.json fija bytes de modelos. demo/package-lock.json tiene integrities npm; se derivó del lock original y todas las versiones compartidas se conservaron, sin resolver transitivas a latest. No ejecutar npm audit fix o pip install -U. La instalación exacta puede conservar advisories existentes; no se cambia por efecto secundario de esta réplica.
''',
'INSTALL_WINDOWS.md':'''# Instalación Windows desde cero

1. Extraer el ZIP completo a una carpeta propia, por ejemplo C:/Bycode/qwen3-tts-replication. No ejecutarlo dentro de otro repositorio npm. Abrir PowerShell allí. Leer LICENSES.md. La instalación escribe sólo en esa carpeta y no desinstala nada.
2. Identificar GPU/driver con nvidia-smi y RAM/arquitectura con Get-CimInstance Win32_ComputerSystem y Win32_OperatingSystem. Referencia comprobada: Windows x64, RTX 4050 6 GB, ~48 GiB RAM. Pico nuevo observado ~2609 MiB asignados de Torch; NO garantiza que 3 GB VRAM totales alcancen. Preferir GPU NVIDIA de 6 GB o más y RAM suficiente para modelos/entornos. Reservar al menos ~15 GB libres (pesos necesarios ~3 GB, Torch/venvs/cachés y Chromium adicionales). No hay prueba de mínimo de RAM ni benchmark de otra GPU.
3. Disponer de CPython 3.12.14 x64 y Node 26.13.0 x64. El host usa Python de runtime Codex; no copiar su venv. Puede utilizarse ese mismo runtime si existe y devuelve exactamente 3.12.14. Alternativamente, uv 0.13.0 comprobó disponibilidad de cpython-3.12.14-windows-x86_64-none. Con uv ya disponible:

```powershell
uv python install 3.12.14 --install-dir "$PWD/.python"
$python = (Get-ChildItem -LiteralPath .python -Filter python.exe -Recurse | Where-Object { $_.FullName -notmatch 'Scripts' } | Select-Object -First 1).FullName
& $python -c "import sys,platform; print(sys.version); print(platform.machine())"
```

Usar CPython, NO PyPy. uv distribuye un build de Python standalone; no se ha probado igualdad byte a byte con el runtime Codex. El criterio comprobable es versión/arquitectura y ejecución posterior. Si uv no está instalado, obtenerlo desde https://docs.astral.sh/uv/getting-started/installation/ o usar otro CPython EXACTO 3.12.14. No instalar otra versión silenciosamente. Node archivado: https://nodejs.org/dist/v26.13.0/ (verificar SHASUMS256.txt del proveedor). Git sólo es necesario para inspecciones; el paquete no clona repositorios.

4. Driver NVIDIA compatible con Torch cu128 y GPU bfloat16. No es obligatorio que el driver del compañero sea 621.01; registrar el suyo. No instalar CUDA Toolkit completo ni FlashAttention. Las wheels Torch de https://download.pytorch.org/whl/cu128 proveen el runtime correspondiente. Si el driver resulta insuficiente, proponer el cambio de driver como intervención del sistema; no hacerlo silenciosamente. AMD/Intel/CPU y GPUs sin bfloat16 no son la ruta auditada: detener el modo exacto y documentar adaptación, no seleccionar otro modelo.
5. Instalar en DOS venv nuevos:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\install.ps1 -Python $python
```

ExecutionPolicy Bypass se limita a ese proceso. El script exige Python exacto; no toca venv existentes y se detiene si ya existen. Si una instalación se interrumpe, conservarla e inspeccionar el error; para reintentar usar otra extracción nueva, sin borrar entornos ajenos. No hay actualización implícita: paquetes pinneados, --no-deps y pip check. La lista incluye paquetes instalados que no se invocan por CLI para conservar el entorno probado.
6. scripts/models.py descarga Base y Whisper de revisiones fijas, valida todos los SHA-256 y no usa tokens. No descarga VoiceDesign: el WAV sintético original ya está incluido. En una red filtrada, descargar archivos desde los mismos repos/revisiones en otro equipo y verificar el mismo manifiesto. Nunca renombrar un modelo distinto para pasar la prueba.
7. Prueba REAL en carpeta nueva:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\\scripts\\test.ps1
```

Produce audio nuevo, JSON por palabra, SRT, transcripción, dos MP4 y qa.json en runs/test-fecha. No se limita a reproducir el WAV entregado. Escuchar el WAV y los MP4, revisar nombres y pausas. Ver VERIFY_INSTALLATION.md y SUBTITLES_VERIFY.md antes de declarar equivalencia.

8. Para otras narraciones, crear un JSON UTF-8 como test-text.json con IDs únicos y textos, luego ejecutar (FFmpeg se resuelve desde ASR):

```powershell
$ffmpeg = & ./.venv-subtitles/Scripts/python.exe -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"
& ./.venv-qwen/Scripts/python.exe scripts/generate.py --ffmpeg $ffmpeg --batch mis-textos.json --out runs/mi-lote --mode bycode-current
```

Una carga de modelo/prompt por lote; guardado por toma, validación SHA-256 y reuse exacto al repetir el mismo lote. Para cambiar una toma preservar el directorio previo y usar --out nuevo. Lotes extensos deben dividir textos en frases completas, sin forzar límites que trunquen la narración. El worker interactivo de los proyectos originales se documenta, no se instala el estudio completo.

## Problemas comprobados y límites

- Avisos SoX/FlashAttention: no son fallo si la inferencia SDPA termina; no instalarlos por defecto.
- Out of memory: cerrar otros trabajos propios o procesar por turnos, acortar lotes/textos; no bajar modelo ni precisión en silencio. Una GPU diferente puede producir WAV distinto aun con seed igual.
- PyAV metadata_errors: el adaptador decodifica con FFmpeg a PCM antes de transcribir.
- Hash distinto: detenerse y revisar revisión/descarga. No editar el manifiesto para aceptar una diferencia.
- Error pip: no sustituir por latest. Locks completos en la raíz; verificar acceso al índice y existencia exacta del artefacto. Si falta, el dueño deberá facilitar wheels redistribuibles de esa versión; no se promete que los índices los conserven para siempre.
- Acentos: JSON, guiones, SRT y reportes en UTF-8; no guardar con la codificación ANSI del editor.
- ASR de nombres propios: conservar transcripción y differences; restaurar sólo aliases declarados, nunca ocultar palabras no pronunciadas. Un ACOUSTIC_MATCH con prompt contextual no es una escucha independiente.
''',
'VERIFY_INSTALLATION.md':'''# Verificar equivalencia

1. Validar PACKAGE_MANIFEST.json con scripts/check_package.py ANTES de instalar. ZIP no contiene modelos ni venv. El manifiesto fija todos los archivos compartidos (excepto él mismo y el ZIP).
2. Ejecutar scripts/verify.py --kind qwen en .venv-qwen y --kind subtitles en .venv-subtitles. Deben coincidir Python, TODAS las versiones del lock, CUDA/bfloat16 y hashes del código Qwen; comprobar pip check. Los extras de bootstrap pip no son identidad de voz.
3. scripts/models.py --verify-only verifica TODOS los archivos de Base/Whisper, no sólo el nombre del directorio. voice/reference.wav debe tener SHA-256 37511600572dd075c64568c80ed829a0a7d35a38a4597f398579b548a1a730f9. Base revision 5d83992436eae1d760afd27aff78a71d676296fc; Whisper revision 536b0662742c02347bc0e980a01041f333bce120.
4. Ejecutar scripts/test.ps1; usa salida nueva runs/. Comparar reference.generation.json con el de demo/public: displayText/spokenText, mode, seed, límite de tokens, effective_generation, modelo, referencia, sample rates, procesamiento y precisión (código auditado). Registrar GPU/driver. Cambiar hardware no autoriza otro checkpoint o referencia.
5. Revisar qa.json: ASR/guion, límites y orden de palabras, continuidad y correlación de audio AAC exportado vs WAV local. Ver SUBTITLES_VERIFY.md. Escuchar nombres, acento, respiración, ritmo y naturalidad, y comprobar visualmente que aparecen/desaparecen en el audio final. Las fronteras de Whisper son estimaciones acústicas.
6. Comparar la muestra incluida y la nueva con el mismo volumen. La duración/frecuencia/canales/transcripción deben ser coherentes, sin corte al final. NO exigir SHA-256 igual entre GPUs: SDPA, librerías y CUDA pueden introducir diferencias; se exige hashes idénticos para modelos, referencia y código Qwen. La tolerancia perceptual no está automatizada; no declarar que un cosine score demuestra la misma voz.

Resultado en este host: verify de ambos entornos PASS, pip check PASS, archivos Base/Whisper auditados por SHA-256, wheel idéntico al código instalado. Prueba de 18 palabras sin diferencias, 6,88 s WAV. Audio AAC sin desplazamiento detectable ni dropouts frente al WAV, correlación >0,9999. La instalación limpia en otra computadora sigue pendiente de ejecución allí.
''',
'SUBTITLES_SYSTEM_REPORT.md':'''# Sistema real de subtítulos

No se encontró WhisperX ni stable-ts como implementación de estos flujos. Hay varias generaciones que no deben confundirse.

| Producción | Fuente de tiempos | Presentación |
|---|---|---|
| DoctorChart tutorial IA, compile-ai-video.py / RetimedBeat.tsx | cue de fragmento completo, fronteras exactas del WAV seleccionado; NO tiempos por palabra | Arial 32 px, dos líneas, izquierda 288 / ancho 1320 / top 987 / alto 84 en 1920x1080 |
| DoctorChart histórico Piper, voice.py | fronteras de muestras de frases sintetizadas separadamente | captions por frase; NO alineación de palabras |
| Pointly tutorial, automation/align.py + revise-captions.mjs | faster-whisper small, audio definitivo, tiempos acústicos por palabra; comparación contra guion | Google Sans 28 px, peso 400, #10284b; izquierda/derecha 220, top 1017, alto 54 en 1920x1080; sin zoom/palabra cinética |
| Reels DoctorChart/Bycode/Pointly | faster-whisper small CPU int8; validación de palabras, montaje según duración real; recorte sólo de silencio exterior | PromoCaptions compartido y adaptaciones de grupos/tamaño de cada pieza |
| Previews sin locución | algunos captions son temporales según guion | no certifican sincronización real |

Pointly automation/align.py usa WhisperModel('small', device='cpu', compute_type='int8', cpu_threads=4,num_workers=1). Ese alias original permite descargar sin revisión fija: la réplica lo sustituye por ruta local a la revisión comprobada 536b0662742c02347bc0e980a01041f333bce120. Es una adaptación explícita para reproducibilidad, no otro modelo. El modelo local de reels tiene esa revisión por metadata de los cuatro archivos.

language='es', beam_size=5, word_timestamps=True, vad_filter=False, condition_on_previous_text=False. Prompt contextual del tutorial: 'Pointly, Bycode Software, DNI, QR, WhatsApp, JPEG, PNG, WebP.'. Los reels usan a veces el texto hablado de la toma como initial_prompt. ASR contextual puede influir en el reconocimiento: no es verificación auditiva independiente ni forced alignment de WhisperX.

Audio → FFmpeg mono float32 16 kHz → Whisper CPU → palabras {word,start,end,probability} en segundos → comparación con guion y correcciones explícitas de escritura → Caption {text,startMs,endMs,timestampMs:null,confidence} → frases/SRT y Remotion. Acentos y puntuación del guion sólo se restauran sobre coincidencias; diferencias quedan registradas. revise-captions.mjs además contiene correcciones revisadas de capítulos concretos; no se aplican a textos arbitrarios.

Los tiempos dependen del WAV definitivo; normalizar o cambiar voz exige realinear. El tutorial no hace time stretching de voz; acelerar capturas no acelera narración ni reloj de captions. Los reels suman offsets de escena, entrada de audio y recorte a los tiempos locales. La prueba aislada empieza a cero y no añade música ni offsets ficticios.

PromoCaptions está en shared/bycode-video-system/src/bycode-promo/captions.tsx. Agrupa hasta cinco palabras o pageBreakAfter; busca grupo por reloj real/FPS, conserva 70 ms al final y activa palabra sólo dentro de su intervalo. Texto activo accentLight, peso de título, scale 1.025; fondo backgroundDark, borde 18, padding 14x22, fuente contextual; fontSize default42, bottom21%, left8%, right16%. Las piezas pueden sobreescribir geometría/grupos: no afirmar que cinco palabras sea universal.

El paquete incluye el artefacto compilado de la misma biblioteca, sin duplicar una biblioteca fuente por producto. La petición explícita autoriza esta distribución interna mínima; no se migra ningún proyecto. El componente tutorial se extrae de Chapter.tsx y su origen queda guardado. No se copian capturas del producto ni datos de pacientes. No existe un componente tutorial compartido equivalente a PromoCaptions en la biblioteca actual.

bycode-brand define marca provisional; bycode-promo aporta presentación comercial y NO transcribe; bycode-tutorial pide textos discretos y distingue guion/audio/tiempos. Ninguna skill convierte los renders de QA en una identidad oficial. El perfil Pointly del demo sigue draft.
''',
'SUBTITLES_DEPENDENCIES.md':'''# Dependencias de subtítulos

Entorno auditado: doctorchart-promo-reel/.local/voice-venv, CPython 3.12.14 x64. Lista completa en subtitles-requirements.lock.txt; lectura directa en evidence/subtitles-environment.json. faster-whisper 1.2.1, CTranslate2 4.8.4, av 19.0.2, tokenizers 0.23.3, HF hub 2.4.0, NumPy 2.4.2, imageio-ffmpeg 0.6.0. No combinar con tokenizers 0.22.2 del venv Qwen.

Modelo multilingual small convertido para CTranslate2: Systran/faster-whisper-small, revisión 536b0662742c02347bc0e980a01041f333bce120. config.json, model.bin, tokenizer.json y vocabulary.txt, todos con tamaño y SHA-256 actual en models-manifest.json. El original descargado utiliza ese commit en .cache/huggingface/download/*.metadata; no se eligió main actual.

CPU int8 es el camino real. No necesita GPU ASR, PyTorch, cuDNN ni instalar WhisperX. La GPU queda para Qwen. FFmpeg decodifica PCM para evitar el error de interfaz PyAV observado en la producción. PyAV es dependencia instalada de faster-whisper aun usando ese workaround.

Remotion 4.0.539 y React19.2.3, artefacto compilado @bycode/video-system0.1.0, fuente Google Sans con OFL. demo/package-lock.json fija transitivas desde el lock fuente. Para QA de correlación se usa scipy ya presente en el lock Qwen. ffprobe se encuentra en compositor Windows instalado por Remotion.
''',
'INSTALL_SUBTITLES_WINDOWS.md':'''# Instalar subtítulos en Windows

INSTALL_WINDOWS.md instala ambos sistemas juntos. Si se instala sólo subtítulos: Python3.12.14 AMD64, crear .venv-subtitles NUEVO, instalar subtitles-requirements.lock.txt con pip --no-deps, ejecutar pip check. Instalar Node26.13.0 y npm ci --prefix demo desde esta carpeta. Mantener la estructura vendor/ al lado de demo/; no hace falta publicar @bycode/video-system.

Ejecutar scripts/models.py desde Python para descargar las revisiones y verificar hashes (descarga ambos modelos requeridos). No usar WhisperModel('small') sin fijar revisión en el equipo nuevo. No instalar los paquetes @remotion/whisper-webgpu sugeridos por guías genéricas: no son la implementación auditada.

```powershell
$ffmpeg = & ./.venv-subtitles/Scripts/python.exe -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"
& ./.venv-subtitles/Scripts/python.exe scripts/align.py --ffmpeg $ffmpeg --audio runs/mi-lote/reference.wav --out runs/mi-lote
node demo/render.mjs runs/mi-lote
```

Para este adaptador el audio se llama reference.wav y lleva reference.generation.json con hash/texto. Se puede generar con test-text.json o con un lote que incluya id='reference'. Para audio externo crear metadata explícita displayText y sha256, sin presentarlo como producido por Qwen. No inventar tiempos si no existe audio o metadata válida.

Revisar SUBTITLES_WORKFLOW.md y SUBTITLES_VERIFY.md. GPU diferente no exige modificar ASR CPU; cualquier traslado a GPU CTranslate2 sería una adaptación nueva no probada y debe mantenerse separado del modo exacto.
''',
'SUBTITLES_WORKFLOW.md':'''# Flujo y contratos

1. Escribir texto UTF-8; conservar displayText y registrar spokenText con aliases. Generar WAV definitivo con scripts/generate.py. Una carga de Base y referencia por lote, una semilla por toma, guardado por archivo y reuse sólo si coinciden firma/hash. El flujo actual no acelera voz.
2. Transcribir el WAV FINAL con scripts/align.py. Se decodifica a 16 kHz mono para reconocimiento; el WAV de entrega conserva 48 kHz estéreo. CPU int8, español, beam5 y tiempos de palabras. No calcular tiempos según cantidad de letras ni dividir duraciones de manera uniforme.
3. Conservar alignment.json: audio_sha256, transcripción ASR sin modificar, probabilidades, diferencias con guion y opciones reales. words.json contiene Caption por palabra. Sólo se corrige tipografía/puntuación de coincidencias y aliases declarados. Errores no coincidentes se mantienen visibles en el reporte y generan REVIEW_REQUIRED.
4. phrases.json agrupa en hasta 88 caracteres o 5,3 s y corta en puntuación fuerte y pausas >500 ms, según parámetros del flujo Pointly revisado (se añade corte explícito de pausas para la muestra portable). reference.srt usa las mismas fronteras reales primera/última palabra y UTF-8. No rellena silencios con tiempos estimados. El segmentador portable simplifica las correcciones de capítulos de revise-captions.mjs: no copia sustituciones de otro guion.
5. node demo/render.mjs runs/nombre usa esas salidas. Tutorial 1920x1080/60: frases estables con estilo discreto extraído del tutorial Pointly. Reel1080x1920/60: PromoCaptions real de biblioteca compilada, destaca palabra por reloj. Ambos usan EL MISMO WAV y el mismo cero temporal. No incorpora CTA ni narrativa de venta.
6. Ejecutar scripts/qa.py y revisar frames/video. Se comprueba el audio AAC decodificado frente al WAV, no sólo que Remotion termine. Audio cambiado → realinear. No editar sólo el SRT y esperar que Remotion cambie: render lee JSON. Editar correcciones, regenerar JSON/SRT juntos, preservar la versión anterior y renderizar en carpeta nueva.

El render se detiene si un MP4 ya existe. Para mantener historial: node demo/render.mjs runs/nombre renders-v2. ASR conserva incertidumbre; una coincidencia textual y probabilidad baja de un nombre propio requieren escucha, no un PASS de identidad vocal.
''',
'SUBTITLES_VERIFY.md':'''# Prueba extremo a extremo y criterios

Se realizó generación NUEVA con la instalación original (sin cambiarla), referencia masculina fija verificada y texto solicitado. WAV6,88s, 24kHz nativo → 48kHz estéreo PCM16, seed20261030/max_new_tokens384. Generación registrada~20,11s; VRAM asignada pico~2608,74MiB. No incluye tiempo de carga.

Se procesó ese WAV definitivo con faster-whisper small revisión fija CPU/int8. 18 palabras, similitud normalizada1.0, sin diferencias; puntuación y marcas escritas restauradas sobre coincidencias. alignment.json conserva el reconocimiento y sus probabilidades: Bycode tiene confianza baja (~0,044) aun siendo texto coincidente, lo que NO debe ocultarse. El prompt de vocabulario puede influir. La pausa entre Software. y En queda fuera de los cues tutorial; no se fabricaron timestamps según texto.

Se exportaron words.json, phrases.json, reference.srt UTF-8 y dos MP4 Remotion. Se revisaron imágenes reales renderizadas para legibilidad y ausencia de recortes. Tutorial usa fuente28px y frases, reel destaca la palabra activa con PromoCaptions. La iteración inicial de segmentación dejaba rápida aislada: se ajustó a 88 caracteres del segmentador revisado existente y se rerenderizó; versiones previas se conservan sólo como QA.

La prueba final está en demo/public/renders-final/. El reporte demo/public/qa.json registra codecs, tamaños, FPS, duración, decodificación, correlación de AAC vs WAV y dropouts. Se comparan señales con correlación cruzada y bloques de100ms de voz; un desfase >40ms o correlación<0,98 falla. En el host se obtuvo correlación>0,9999, desfase0 y ningún dropout. Los clips duran~6,89s/413 frames, 60fps, AAC48kHz estéreo. La diferencia de duración respecto al WAV es redondeo de frames/encapsulado.

Para revisión perceptual abrir reference.wav y ambos MP4. Confirmar Bycode/Pointly, acentos, última palabra completa, pausas, texto activo y ausencia de audio cortado. La auditoría técnica y la inspección visual NO sustituyen la aprobación humana de naturalidad/pronunciación ni prueban exactitud fonética de cada frontera. No se declara una escucha humana realizada ni marca aprobada.

En el equipo nuevo test.ps1 genera en runs/ y ejecuta el mismo pipeline y QA. No basta abrir el WAV incluido o ejecutar scripts sin comparar salidas. Exigir igualdad de hashes de pesos/referencia/código, versiones pinneadas, texto/opciones y una revisión audiovisual; se permite variación de audio entre GPUs con justificación. La instalación limpia en ese equipo no fue ejecutada en esta auditoría.
''',
'LICENSES.md':'''# Procedencia y distribución

Qwen3-TTS código y modelos: Apache-2.0, según metadata del wheel y tarjetas oficiales. Wheel original con licencia incluida en vendor/; texto extraído a vendor/QWEN-LICENSE.txt. Fuentes: https://github.com/QwenLM/Qwen3-TTS y https://huggingface.co/Qwen/Qwen3-TTS-12Hz-0.6B-Base. VoiceDesign histórico: https://huggingface.co/Qwen/Qwen3-TTS-12Hz-1.7B-VoiceDesign.

Whisper convertido Systran: MIT según tarjeta https://huggingface.co/Systran/faster-whisper-small. Implementación faster-whisper: https://github.com/SYSTRAN/faster-whisper. No se redistribuyen pesos.

Google Sans: se conserva OFL.txt junto al WOFF2 original. FFmpeg se obtiene mediante imageio-ffmpeg pinneado; consultar README/licencias del wheel, no se distribuye aquí un ejecutable aislado sin sus avisos. PyTorch y dependencias conservan sus licencias en sus paquetes.

Remotion tiene términos propios: https://www.remotion.dev/license. Uso local no implica licencia comercial universal gratuita; revisar elegibilidad según persona/organización antes de producción. No se contrataron servicios ni APIs. El paquete puede instalarse/ejecutarse localmente sin servicio de generación pago.

La biblioteca @bycode/video-system es private y no declara licencia pública. Esta copia compilada mínima se incluye por autorización explícita del propietario para compartir internamente con su compañero. No atribuirle MIT/Apache ni publicarla. El diseño sigue draft. Las copias de scripts y componentes de evidence son procedencia de Bycode, no una licencia para publicar el repositorio. No se incluyeron grabaciones personales ni música suministrada para otros trabajos.
''',
'PROMPT_FOR_CODEX.md':'''# Instalar réplica auditada de narración y subtítulos Bycode

Actuá en ESTA computadora Windows y en la carpeta extraída qwen3-tts-replication. El objetivo autorizado es instalar y probar localmente el entorno auditado de otra computadora, con la misma voz sintética masculina y subtítulos acústicos. Esta carpeta es autónoma: no necesitás el repositorio Bycode ni acceso al equipo original. No uses servicios pagos, cuentas, tokens ni APIs de inferencia.

Leé primero README.md, INSTALLATION_REPORT.md, MODEL_AND_VOICE.md, DEPENDENCIES.md, INSTALL_WINDOWS.md, VERIFY_INSTALLATION.md, los cinco documentos SUBTITLES/INSTALL_SUBTITLES, LICENSES.md y los manifiestos. Ejecutá scripts/check_package.py con un Python disponible antes de instalar (stdlib). Inspeccioná scripts antes de ejecutarlos. No ejecutar scripts/audit.py ni write_docs.py: son evidencia del armado en el equipo original.

1. Inventariá Windows/arquitectura, CPU/RAM, GPU/VRAM, driver NVIDIA, Python y Node. No confundas CUDA de nvidia-smi con runtime CUDA de Torch. Preservá instalaciones existentes: trabajar sólo en esta carpeta, con nuevos venv, sin ramas/worktrees ni cambios globales. Documentá diferencias frente a Windows11 x64/RTX4050 6GB/CPython3.12.14/Node26.13.0.
2. Conseguí CPython3.12.14 x64 y Node26.13.0 usando proveedores oficiales. Si usás uv, seleccioná CPython3.12.14 explícitamente y directorio .python bajo esta carpeta. No usar PyPy ni newest. Analizá compatibilidad CUDA/bfloat16; driver host original621.01, Torch2.9.1+cu128/runtime12.8. Si no es viable el modo exacto, reportá la limitación antes de adoptar adaptaciones. No cambies checkpoint, referencia ni precisión silenciosamente. No instales drivers del sistema sin aclarar esa intervención.
3. Ejecutá scripts/install.ps1 -Python RUTA_EXACTA. Crea .venv-qwen y .venv-subtitles separados, instala locks completos exactos, wheel Qwen incluido, Torch/torchaudio2.9.1+cu128 del índice oficial, y npm ci --prefix demo con lock. No pip -U, npm update, npm audit fix ni resolver a latest. Si ya hay venv, inspeccioná y preservá: no pisarlos. Si un artefacto exacto falta, detener ese paso y documentar, no sustituir versiones.
4. Modelo obligatorio Qwen/Qwen3-TTS-12Hz-0.6B-Base revisión5d83992436eae1d760afd27aff78a71d676296fc con speech_tokenizer de esa misma revisión. Whisper Systran/faster-whisper-small revisión536b0662742c02347bc0e980a01041f333bce120. scripts/models.py descarga archivos exactos y exige TODOS los SHA-256 del manifiesto. No usar main ni repositores alternativos. No hace falta VoiceDesign1.7B: sólo fue origen de la referencia ya creada.
5. Voz obligatoria doctorchart-masculina-01: voice/reference.wav SHA25637511600572dd075c64568c80ed829a0a7d35a38a4597f398579b548a1a730f9. Es sintética, no una grabación personal. Mantener transcripción literal profile.reference_spoken_text. create_voice_clone_prompt con x_vector_only_mode=False; NO elegir voz masculina de catálogo ni regenerar la referencia a partir de descripción. Una carga de modelo/prompt por lote, checkpoint por toma.
6. Generación: CUDA:0, bfloat16, SDPA, threads/interop1, Spanish, non_streaming_mode=True. do_sample=True/top_k50/top_p1/temperature0.9/repetition_penalty1.05; subtalker samplingTrue/top_k50/top_p1/temperature0.9. Modo default bycode-current, seed20261030 para primera toma, límite min(2048,max(384,palabras*12)), Bycode hablado báicod; respetar texto escrito de test-text.json. Hay modes históricos explícitos documentados; no confundir la pronunciación baicode de scripts antiguos con la recomendación vigente. Normalización comprobada loudnorm -16LUFS/TP-1.5/LRA7, PCM16/48kHz estéreo, voz sin aceleración.
7. Ejecutá scripts/test.ps1 para producir audio NUEVO en runs/ con el texto «Bienvenidos a Bycode Software. En este tutorial vamos a aprender a utilizar Pointly de forma sencilla y rápida.». No reutilices el WAV entregado como si fuera prueba de generación del equipo nuevo. Registrar metadatos reales, GPU y tiempos.
8. Transcribir ese audio FINAL con scripts/align.py y faster-whisperCPU/int8 español, beam5, timestamps de palabra, sin VAD ni contexto previo. PCM16k mono decodificado por FFmpeg, prompt de marcas explícito. Conservar transcripción cruda, probabilidades y differences. Exportar SRTUTF8, words.json y phrases.json. No inventar tiempos por longitud del texto ni reemplazar palabras no escuchadas con el guion. Esto es alineación acústica Whisper, no WhisperX forced alignment.
9. Renderizar clip tutorial1920x1080 y reel1080x1920/60fps con demo/render.mjs, fuente local y biblioteca compilada incluida. Tutorial:28px discreto sin animación cinética; reel:PromoCaptions real con palabra activa. Marca draft; no inventar logo ni publicar. No hace falta copiar el repo original. Si cambia audio, realinear y renderizar en salida nueva preservando previos.
10. Ejecutar scripts/verify.py en ambos venv, pip check, scripts/models.py --verify-only y scripts/qa.py sobre WAV/MP4 nuevos. Examinar imágenes/video, diferencias ASR, cortes y pausas, y comparar audio AAC decodificado con WAV. No declarar éxito sólo por exit code. Usar demo/public/qa.json y renders-final como referencia técnica; coincidencia byte a byte de WAV entre GPUs NO es obligatoria. Igualdad de pesos/referencia/código/versiones/configuración SÍ. No atribuir aprobación humana de voz, pronunciación o marca a checks automáticos.

Dejá un informe de hardware, comandos, versiones, hashes, resultados y límites dentro de esta carpeta. Entregá comandos sencillos para generar otro lote UTF8 y subtitular el audio definitivo. Informá cualquier bloqueo concreto y seguí verificando las partes independientes autorizadas. No actualices ni desinstales entornos ajenos y no publiques material. El trabajo termina con prueba local real, artefactos reproducibles y limitaciones honestas.
'''
}
for name,text in docs.items():(ROOT/name).write_text(text,encoding='utf8')
wheel=next((ROOT/'vendor').glob('*.whl'))
with zipfile.ZipFile(wheel) as z:
 licenses=[x for x in z.namelist() if x.endswith('/LICENSE')]
 if licenses:(ROOT/'vendor/QWEN-LICENSE.txt').write_bytes(z.read(licenses[0]))
print('Wrote',len(docs),'documents')
