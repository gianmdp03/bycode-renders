# Dependencias reales y versiones

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

Comprobación adicional: dry-run de instalación de todos los pins ASR y Qwen (salvo Torch/torchaudio, que usa índice separado) pasó sin sustituir versiones. FFmpeg de ambos entornos audio/ASR coincide por SHA-256; ver evidence/ffmpeg-hash.json. npm ci del demo se ejecutó en su propio node_modules y el render final lo utilizó, sin depender del link del workspace original.

Runtime CUDA adicional comprobado: cuDNN runtime 91002, compute capability [8, 9], bfloat16_supported=True. La versión de un CUDA Toolkit instalado por separado no se verificó; no es requisito de esta ruta por wheels.
