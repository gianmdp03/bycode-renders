# Auditoría real de la instalación

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
