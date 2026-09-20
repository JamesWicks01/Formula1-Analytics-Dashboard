Set-StrictMode -Version Latest
$ErrorActionPreference = "Stop"

$root = Split-Path -Parent $MyInvocation.MyCommand.Path
$backend = Join-Path $root "backend"
$frontend = Join-Path $root "frontend"

if (Test-Path (Join-Path $backend "requirements.txt")) {
    Write-Host "Installing backend requirements..."
    python -m pip install -r (Join-Path $backend "requirements.txt")
}

if (Test-Path (Join-Path $frontend "package.json")) {
    Write-Host "Installing frontend dependencies..."
    Push-Location $frontend
    try {
        if (Test-Path "package-lock.json") {
            npm ci
        }
        else {
            npm install
        }
    }
    finally {
        Pop-Location
    }
}

Write-Host "Setup complete."