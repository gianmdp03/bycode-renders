# Instalar subtítulos en Windows

INSTALL_WINDOWS.md instala ambos sistemas juntos. Si se instala sólo subtítulos: Python3.12.14 AMD64, crear .venv-subtitles NUEVO, instalar subtitles-requirements.lock.txt con pip --no-deps, ejecutar pip check. Instalar Node26.13.0 y npm ci --prefix demo desde esta carpeta. Mantener la estructura vendor/ al lado de demo/; no hace falta publicar @bycode/video-system.

Ejecutar scripts/models.py desde Python para descargar las revisiones y verificar hashes (descarga ambos modelos requeridos). No usar WhisperModel('small') sin fijar revisión en el equipo nuevo. No instalar los paquetes @remotion/whisper-webgpu sugeridos por guías genéricas: no son la implementación auditada.

```powershell
$ffmpeg = & ./.venv-subtitles/Scripts/python.exe -c "import imageio_ffmpeg; print(imageio_ffmpeg.get_ffmpeg_exe())"
& ./.venv-subtitles/Scripts/python.exe scripts/align.py --ffmpeg $ffmpeg --audio runs/mi-lote/reference.wav --out runs/mi-lote
node demo/render.mjs runs/mi-lote
```

Para este adaptador el audio se llama reference.wav y lleva reference.generation.json con hash/texto. Se puede generar con test-text.json o con un lote que incluya id='reference'. Para audio externo crear metadata explícita displayText y sha256, sin presentarlo como producido por Qwen. No inventar tiempos si no existe audio o metadata válida.

Revisar SUBTITLES_WORKFLOW.md y SUBTITLES_VERIFY.md. GPU diferente no exige modificar ASR CPU; cualquier traslado a GPU CTranslate2 sería una adaptación nueva no probada y debe mantenerse separado del modo exacto.
