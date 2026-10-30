$ErrorActionPreference = 'Stop'
$qwenRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $qwenRoot
$qwenPython = Join-Path $qwenRoot '.local\qwen-venv\Scripts\python.exe'
if (-not (Test-Path -LiteralPath $qwenPython)) {
    $qwenBasePython = Join-Path $qwenRoot '.local\voice-venv\Scripts\python.exe'
    if (-not (Test-Path -LiteralPath $qwenBasePython)) { throw 'No se encontro el Python del proyecto.' }
    & $qwenBasePython -m venv (Join-Path $qwenRoot '.local\qwen-venv')
    if ($LASTEXITCODE -ne 0) { throw 'No se pudo crear el entorno separado.' }
}
& $qwenPython -m pip install 'torch==2.9.1+cu128' 'torchaudio==2.9.1+cu128' --index-url https://download.pytorch.org/whl/cu128 --disable-pip-version-check
if ($LASTEXITCODE -ne 0) { throw 'No se pudo instalar PyTorch con CUDA.' }
& $qwenPython -m pip install 'qwen-tts==0.1.1' --disable-pip-version-check
if ($LASTEXITCODE -ne 0) { throw 'No se pudo instalar Qwen TTS.' }
& $qwenPython -u (Join-Path $PSScriptRoot 'setup-qwen.py')
if ($LASTEXITCODE -ne 0) { throw 'La descarga del modelo no se completo. Se puede reintentar conservando el progreso.' }
& $qwenPython -u (Join-Path $PSScriptRoot 'setup-qwen.py') --base-small
if ($LASTEXITCODE -ne 0) { throw 'No se completo la descarga del modelo residente.' }
Write-Host 'Instalacion terminada. Ya podes ejecutar Probar voz Qwen.cmd.'
