Param(
    [Parameter(Mandatory=$false, ValueFromRemainingArguments=$true)]
    [String[]]$TerraformArgs
)

# Name of the image and Dockerfile
$IMAGE_NAME = "my-terraform"
$DOCKERFILE = "Dockerfile.terraform"

# Project root directory (contains 'terraform/' and 'packages/')
# This is equivalent to 'pwd' on macOS/Linux
$PROJECT_DIR = (Get-Location).Path

# Build the image (optional if done frequently)
docker build -t $IMAGE_NAME -f $DOCKERFILE .

# If no arguments are passed, default to 'init && apply'
if (-not $TerraformArgs) {
    $CMD = "terraform init && terraform apply"
} else {
    $joinedArgs = $TerraformArgs -join " "
    $CMD = "terraform $joinedArgs"
}

Write-Host "Executing command: $CMD" -ForegroundColor Cyan

# Generate a unique container name
$containerName = "terraform-temp-" + ([guid]::NewGuid().ToString())

# Run the container interactively without piping output.
# The user will see the interactive session.
docker run --name $containerName -it `
    -v "${PROJECT_DIR}:/workspace" `
    -w /workspace/terraform `
    $IMAGE_NAME `
    $CMD

# After the interactive session ends, capture the exit code.
$exitCode = $LASTEXITCODE

# Retrieve the logs from the container (i.e. the output from the interactive session).
$output = docker logs $containerName | Out-String

# Remove the container now that we've captured its logs.
docker rm $containerName | Out-Null

# Now check if the command failed.
if ($exitCode -ne 0) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "Terraform command failed with exit code $exitCode." -ForegroundColor Red
    Write-Host "Error Output:" -ForegroundColor Red
    Write-Host $output -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red

    # Custom error messages based on known patterns
    if ($output -match "The following organization members have reached their maximum limits") {
         Write-Host "What went wrong?: You have more than 1 active Supabase project in your organization." -ForegroundColor Red
    }
    elseif ($output -match "timeout" -or $output -match "did not reach") {
         Write-Host "Custom Error: The operation timed out. Verify that the remote service is accessible and that your network is stable." -ForegroundColor Red
    }
    elseif ($output -match "connection refused" -or $output -match "could not connect") {
         Write-Host "Custom Error: Unable to connect to the remote service. Please ensure the service endpoint is correct and accessible." -ForegroundColor Red
    }
    else {
         Write-Host "Custom Error: An unknown error occurred. Please review the output above." -ForegroundColor Red
    }
    exit $exitCode
} else {
    Write-Host "Terraform output:" -ForegroundColor Green
    Write-Host $output
}
