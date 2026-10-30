param([switch]$NoBrowser)
$ErrorActionPreference='Stop'
$aiRoot=Split-Path -Parent $PSScriptRoot
function Test-AIStudioReady {
    try { $aiResponse=Invoke-RestMethod -Uri 'http://127.0.0.1:3320/api/project' -TimeoutSec 2; return $aiResponse.title -like 'DoctorChart*Estudio de voz IA' -and $aiResponse.segments.Count -eq 144 } catch { return $false }
}
try {
    if (-not (Test-AIStudioReady)) {
        $aiNode=(Get-Command node -ErrorAction Stop).Source
        $aiData=Join-Path $aiRoot '.local\ai-narration-studio'
        New-Item -ItemType Directory -Path $aiData -Force | Out-Null
        $aiScript=Join-Path $PSScriptRoot 'ai-narration-studio.mjs'
        $aiProcess=Start-Process -FilePath $aiNode -ArgumentList @('"'+$aiScript+'"') -WorkingDirectory $aiRoot -WindowStyle Hidden -RedirectStandardOutput (Join-Path $aiData 'server.log') -RedirectStandardError (Join-Path $aiData 'server-error.log') -PassThru
        $aiReady=$false
        for ($aiAttempt=0;$aiAttempt -lt 25;$aiAttempt++) {
            if (Test-AIStudioReady) { $aiReady=$true;break }
            if ($aiProcess.HasExited) { break }
            Start-Sleep -Milliseconds 200
        }
        if (-not $aiReady) { throw 'No se pudo abrir el estudio IA. Las grabaciones personales se conservan en el otro estudio.' }
    }
    if (-not $NoBrowser) { Start-Process 'http://localhost:3320' }
    Write-Host 'Estudio IA listo en http://localhost:3320. Tu voz personal sigue en el estudio 3310.'
} catch { Write-Host $_.Exception.Message -ForegroundColor Red;exit 1 }
