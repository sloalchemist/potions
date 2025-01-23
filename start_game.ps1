# check if port is occupied, if so kill pid
function check_port_3000 {
    # Get the PID of the process using port 3000
    $processID = Get-NetTCPConnection -LocalPort 3000 | Select-Object -ExpandProperty OwningProcess
    # For Mac/Linux machines: $processID = (lsof -t -i:3000)
    # Check if a PID was found
    if ($processID) {
        # Kill the process
        Stop-Process -Id $processID
    }
}

# setup root, server, and auth server
Start-Process -NoNewWindow -FilePath "pnpm" -ArgumentList "install" -Wait
Start-Process -NoNewWindow -FilePath "pnpm" -ArgumentList "build" -Wait
echo "cd packages/server"
cd packages/server
Start-Process -NoNewWindow -FilePath "pnpm" -ArgumentList "run create test-world" -Wait
cd ../auth-server

check_port_3000

# Start the process and redirect output to a log file
Start-Process -NoNewWindow -FilePath "pnpm" -ArgumentList "dev" -RedirectStandardOutput "auth-server-out.log" -RedirectStandardError "auth-server-error.log"

# Wait until the log file is created and "yo!" appears in the log file
while (-not (Test-Path -Path "auth-server-out.log")) {
    Start-Sleep -Seconds 1
}
while (-not (Select-String -Path "auth-server-out.log" -Pattern "yo!" -Quiet)) {
    Start-Sleep -Seconds 1
}

# clean up
Remove-Item -Path "auth-server-out.log"
Remove-Item -Path "auth-server-error.log"
Write-Host "auth server is ready."