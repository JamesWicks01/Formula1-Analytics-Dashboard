Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$backend = Join-Path $PSScriptRoot "backend"
$frontend = Join-Path $PSScriptRoot "frontend"
$python = (Get-Command python -ErrorAction Stop).Source
$npm = (Get-Command npm.cmd -ErrorAction Stop).Source

if (-not (Test-Path (Join-Path $frontend "node_modules"))) {
    throw "Frontend dependencies are missing. Run .\setup.ps1 first."
}

& $python -c "import uvicorn, fastapi, pandas, multipart"
if ($LASTEXITCODE -ne 0) {
    throw "Backend dependencies are missing. Run .\setup.ps1 first."
}

$jobs = @()
try {
    $jobs += Start-Job -Name "Backend" -ArgumentList $backend, $python -ScriptBlock {
        param($directory, $executable)
        Set-Location -LiteralPath $directory
        & $executable -m uvicorn app.main:app --reload --host 127.0.0.1 --port 8000
        if ($LASTEXITCODE -ne 0) { throw "Backend exited with code $LASTEXITCODE." }
    }

    $jobs += Start-Job -Name "Frontend" -ArgumentList $frontend, $npm -ScriptBlock {
        param($directory, $executable)
        Set-Location -LiteralPath $directory
        & $executable run dev -- --host localhost --port 5173 --strictPort
        if ($LASTEXITCODE -ne 0) { throw "Frontend exited with code $LASTEXITCODE." }
    }

    Write-Host "Starting backend:  http://127.0.0.1:8000"
    Write-Host "Starting frontend: http://localhost:5173"
    Write-Host "Press Ctrl+C to stop both servers."

    while ($true) {
        # Native server logs use stderr as well as stdout.
        $jobs | Receive-Job -ErrorAction Continue
        $finished = $jobs | Where-Object { $_.State -ne "Running" }
        if ($finished) {
            $jobs | Receive-Job -ErrorAction Continue
            throw "A server stopped. Check the output above for details."
        }
        Start-Sleep -Milliseconds 250
    }
}
finally {
    if ($jobs.Count -gt 0) {
        $jobs | Stop-Job
        $jobs | Remove-Job -Force
    }
}
