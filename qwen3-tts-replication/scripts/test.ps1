param([string]$RunName = ('test-' + (Get-Date -Format 'yyyyMMdd-HHmmss')))
$ErrorActionPreference='Stop'
$packageRoot=Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $packageRoot
if ($RunName -notmatch '^[a-zA-Z0-9_-]+$') { throw 'RunName inválido' }
$runDir=Join-Path $packageRoot "runs/$RunName"
if (Test-Path -LiteralPath $runDir) { throw 'Usar un nombre nuevo para preservar pruebas previas.' }
$qwenPython=Join-Path $packageRoot '.venv-qwen/Scripts/python.exe'
$subPython=Join-Path $packageRoot '.venv-subtitles/Scripts/python.exe'
$ffmpegPath=& $subPython -c 'import imageio_ffmpeg;print(imageio_ffmpeg.get_ffmpeg_exe())'
if ($LASTEXITCODE -ne 0) { throw 'No se encontró FFmpeg' }
& $qwenPython scripts/models.py --verify-only
if ($LASTEXITCODE -ne 0) { throw 'Falló integridad de modelos' }
& $qwenPython scripts/generate.py --ffmpeg $ffmpegPath --out "runs/$RunName"
if ($LASTEXITCODE -ne 0) { throw 'Falló generación' }
& $subPython scripts/align.py --ffmpeg $ffmpegPath --audio (Join-Path $runDir 'reference.wav') --out $runDir
if ($LASTEXITCODE -ne 0) { throw 'Falló alineación' }
& node demo/render.mjs $runDir
if ($LASTEXITCODE -ne 0) { throw 'Falló render' }
& $qwenPython scripts/qa.py --ffmpeg $ffmpegPath --assets $runDir
if ($LASTEXITCODE -ne 0) { throw 'Falló QA audiovisual' }
Write-Host "Prueba nueva guardada en $runDir. Revisar diferencias ASR y escuchar ambos videos."
