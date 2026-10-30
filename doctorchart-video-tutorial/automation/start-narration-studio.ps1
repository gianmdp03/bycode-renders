param([switch]$NoBrowser)
$ErrorActionPreference = 'Stop'
$studioRoot = Split-Path -Parent $PSScriptRoot
$studioUrl = 'http://localhost:3310'
function Test-StudioReady {
    try {
        $studioResponse = Invoke-RestMethod -Uri 'http://127.0.0.1:3310/api/project' -TimeoutSec 2
        return $studioResponse.title -like 'DoctorChart*Estudio de narraci*' -and $studioResponse.segments.Count -eq 144
    } catch { return $false }
}
try {
    if (-not (Test-StudioReady)) {
        $studioNode = (Get-Command node -ErrorAction Stop).Source
        $studioData = Join-Path $studioRoot '.local\narration-studio'
        New-Item -ItemType Directory -Path $studioData -Force | Out-Null
        $studioScript = Join-Path $PSScriptRoot 'narration-studio.mjs'
        $studioProcess = Start-Process -FilePath $studioNode -ArgumentList @('"' + $studioScript + '"') -WorkingDirectory $studioRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $studioData 'server.log') -RedirectStandardError (Join-Path $studioData 'server-error.log') -PassThru
        $studioReady = $false
        for ($studioAttempt = 0; $studioAttempt -lt 25; $studioAttempt++) {
            if (Test-StudioReady) { $studioReady = $true; break }
            if ($studioProcess.HasExited) { break }
            Start-Sleep -Milliseconds 200
        }
        if (-not $studioReady) { throw 'No se pudo iniciar el estudio. Revisá .local\narration-studio\server-error.log. Los audios guardados se conservan.' }
    }
    if (-not $NoBrowser) { Start-Process $studioUrl }
    Write-Host 'Estudio abierto. Tus guiones y grabaciones se guardan en este equipo.'
} catch {
    Write-Host $_.Exception.Message -ForegroundColor Red
    exit 1
}
