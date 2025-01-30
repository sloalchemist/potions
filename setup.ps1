function Show-Usage {
    Write-Host "Usage: ./setup.ps1 [options]"
    Write-Host "Options:"
    Write-Host "  --build          Build the project"
    Write-Host "  --create-world   Create the test world"
    Write-Host "  --auth-server    Start the Auth-Server in a new tab"
    Write-Host "  --server         Start the Server in a new tab"
    Write-Host "  --client         Start the Client in a new tab"
    Write-Host "  --all            Run all the above steps"
    exit 1
}

# Auto set base dir to the script's location
$ScriptPath = $PSScriptRoot
$BaseDir = Join-Path -Path $ScriptPath -ChildPath "packages"

# Check base dir
if (-Not (Test-Path -Path $BaseDir)) {
    Write-Host "Directory '$BaseDir' does not exist."
    exit 1
}

if ($args.Count -eq 0) {
    Show-Usage
}

function Build-Project {
    pnpm build
    Write-Host "Building world"
}

function Create-Test-World {
    Push-Location -Path (Join-Path -Path $BaseDir -ChildPath "server")
    pnpm run create test-world
    Write-Host "Creating test world"
    Pop-Location
}

function Start-Auth-Server {
    Write-Host "Starting Auth-Server in a new console tab..."
    Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoExit", "-Command", "cd $(Join-Path -Path $BaseDir -ChildPath 'auth-server'); pnpm dev" `
        -WorkingDirectory (Join-Path -Path $BaseDir -ChildPath "auth-server")
}

function Start-Server {
    Write-Host "Starting Server in a new console tab..."
    Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoExit", "-Command", "cd $(Join-Path -Path $BaseDir -ChildPath 'server'); pnpm dev test-world" `
        -WorkingDirectory (Join-Path -Path $BaseDir -ChildPath "server")
}

function Start-Client {
    Write-Host "Starting Client in a new console tab..."
    Start-Process -FilePath "powershell.exe" `
        -ArgumentList "-NoExit", "-Command", "cd $(Join-Path -Path $BaseDir -ChildPath 'client'); pnpm start" `
        -WorkingDirectory (Join-Path -Path $BaseDir -ChildPath "client")
}

foreach ($arg in $args) {
    switch ($arg) {
        "--build" { Build-Project }
        "--create-world" { Create-Test-World }
        "--auth-server" { Start-Auth-Server }
        "--server" { Start-Server }
        "--client" { Start-Client }
        "--all" {
            Build-Project
            Create-Test-World
            Start-Auth-Server
            Start-Server
            Start-Client
        }
        default {
            Write-Host "Unknown option: $arg"
            Show-Usage
        }
    }
}

Write-Host "Done."
