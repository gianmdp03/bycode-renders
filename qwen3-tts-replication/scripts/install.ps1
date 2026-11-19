param([Parameter(Mandatory=$true)][string]$Python)
$ErrorActionPreference = 'Stop'
$packageRoot = Split-Path -Parent $PSScriptRoot
Set-Location -LiteralPath $packageRoot
function Invoke-Checked([string]$Exe,[string[]]$Arguments) {
    & $Exe @Arguments
    if ($LASTEXITCODE -ne 0) { throw "Falló $Exe; se detiene sin cambiar versiones." }
}
$actual = & $Python -c "import platform; print(platform.python_version()); print(platform.machine())"
if ($LASTEXITCODE -ne 0 -or $actual[0] -ne '3.12.14' -or $actual[1] -ne 'AMD64') { throw 'Se requiere Python 3.12.14 x64. Ver INSTALL_WINDOWS.md.' }
Invoke-Checked $Python @('scripts/check_package.py')
if (Test-Path -LiteralPath (Join-Path $packageRoot '.venv-qwen')) { throw 'Ya existe .venv-qwen; verificarla manualmente, no modificar una instalación existente.' }
if (Test-Path -LiteralPath (Join-Path $packageRoot '.venv-subtitles')) { throw 'Ya existe .venv-subtitles; verificarla manualmente.' }
Invoke-Checked $Python @('-m','venv',(Join-Path $packageRoot '.venv-qwen'))
Invoke-Checked $Python @('-m','venv',(Join-Path $packageRoot '.venv-subtitles'))
$qwenPython = Join-Path $packageRoot '.venv-qwen/Scripts/python.exe'
$subPython = Join-Path $packageRoot '.venv-subtitles/Scripts/python.exe'
Invoke-Checked $qwenPython @('-m','pip','install','--no-deps','torch==2.9.1+cu128','torchaudio==2.9.1+cu128','--index-url','https://download.pytorch.org/whl/cu128','--disable-pip-version-check')
$filtered = Get-Content -LiteralPath 'qwen-requirements.lock.txt' | Where-Object { $_ -notmatch '^(torch|torchaudio|qwen-tts)==' }
$filtered | Set-Content -LiteralPath 'qwen-runtime-install.lock.txt' -Encoding utf8
Invoke-Checked $qwenPython @('-m','pip','install','--no-deps','--requirement','qwen-runtime-install.lock.txt','--index-url','https://pypi.org/simple','--disable-pip-version-check')
Invoke-Checked $qwenPython @('-m','pip','install','--no-deps','vendor/qwen_tts-0.1.1-py3-none-any.whl','--disable-pip-version-check')
Invoke-Checked $subPython @('-m','pip','install','--no-deps','--requirement','subtitles-requirements.lock.txt','--index-url','https://pypi.org/simple','--disable-pip-version-check')
Invoke-Checked $qwenPython @('-m','pip','check')
Invoke-Checked $subPython @('-m','pip','check')
Invoke-Checked $qwenPython @('scripts/models.py')
Invoke-Checked 'npm.cmd' @('ci','--prefix',(Join-Path $packageRoot 'demo'),'--no-audit','--no-fund')
Invoke-Checked $qwenPython @('scripts/verify.py','--kind','qwen')
Invoke-Checked $subPython @('scripts/verify.py','--kind','subtitles')
Write-Host 'Instalación verificada. Ejecutar scripts/test.ps1 para generar AUDIO NUEVO.'
