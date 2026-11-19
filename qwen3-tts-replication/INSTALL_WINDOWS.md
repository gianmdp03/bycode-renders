# Instalación Windows desde cero

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
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\install.ps1 -Python $python
```

ExecutionPolicy Bypass se limita a ese proceso. El script exige Python exacto; no toca venv existentes y se detiene si ya existen. Si una instalación se interrumpe, conservarla e inspeccionar el error; para reintentar usar otra extracción nueva, sin borrar entornos ajenos. No hay actualización implícita: paquetes pinneados, --no-deps y pip check. La lista incluye paquetes instalados que no se invocan por CLI para conservar el entorno probado.
6. scripts/models.py descarga Base y Whisper de revisiones fijas, valida todos los SHA-256 y no usa tokens. No descarga VoiceDesign: el WAV sintético original ya está incluido. En una red filtrada, descargar archivos desde los mismos repos/revisiones en otro equipo y verificar el mismo manifiesto. Nunca renombrar un modelo distinto para pasar la prueba.
7. Prueba REAL en carpeta nueva:

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\scripts\test.ps1
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
