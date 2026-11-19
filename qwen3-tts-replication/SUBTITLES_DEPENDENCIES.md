# Dependencias de subtítulos

Entorno auditado: doctorchart-promo-reel/.local/voice-venv, CPython 3.12.14 x64. Lista completa en subtitles-requirements.lock.txt; lectura directa en evidence/subtitles-environment.json. faster-whisper 1.2.1, CTranslate2 4.8.4, av 19.0.2, tokenizers 0.23.3, HF hub 2.4.0, NumPy 2.4.2, imageio-ffmpeg 0.6.0. No combinar con tokenizers 0.22.2 del venv Qwen.

Modelo multilingual small convertido para CTranslate2: Systran/faster-whisper-small, revisión 536b0662742c02347bc0e980a01041f333bce120. config.json, model.bin, tokenizer.json y vocabulary.txt, todos con tamaño y SHA-256 actual en models-manifest.json. El original descargado utiliza ese commit en .cache/huggingface/download/*.metadata; no se eligió main actual.

CPU int8 es el camino real. No necesita GPU ASR, PyTorch, cuDNN ni instalar WhisperX. La GPU queda para Qwen. FFmpeg decodifica PCM para evitar el error de interfaz PyAV observado en la producción. PyAV es dependencia instalada de faster-whisper aun usando ese workaround.

Remotion 4.0.539 y React19.2.3, artefacto compilado @bycode/video-system0.1.0, fuente Google Sans con OFL. demo/package-lock.json fija transitivas desde el lock fuente. Para QA de correlación se usa scipy ya presente en el lock Qwen. ffprobe se encuentra en compositor Windows instalado por Remotion.
