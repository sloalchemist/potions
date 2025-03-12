Param(
    [Parameter(Mandatory=$false, ValueFromRemainingArguments=$true)]
    [String[]]$TerraformArgs
)

# Name of the Docker image / Dockerfile
$IMAGE_NAME = "my-terraform"
$DOCKERFILE = "Dockerfile.terraform"

# Project root directory (one level above 'terraform/'),
# i.e., the folder where you run this script.
$PROJECT_DIR = (Get-Location).Path

# 1) Build the Docker image (optional if done frequently)
docker build -t $IMAGE_NAME -f $DOCKERFILE .

# 2) Determine which Terraform command to run
if (-not $TerraformArgs) {
    $CMD = "terraform init && terraform apply"
} else {
    $joinedArgs = $TerraformArgs -join " "
    $CMD = "terraform $joinedArgs"
}

# 3) Build the final command by running the CRLF check script first.
#    If the CRLF check fails, Terraform will not run.
$FinalCMD = "/workspace/check-line-endings.sh /workspace && $CMD"

Write-Host "Executing command: $FinalCMD" -ForegroundColor Cyan

# 4) Docker run:
#    - Mount entire project at /workspace
#    - Set working directory to /workspace/terraform
$volumeMount = "${PROJECT_DIR}:/workspace"

# Generate a unique container name so we can capture logs later.
$containerName = "terraform-temp-" + ([guid]::NewGuid().ToString())

# Run the container interactively (with -it) without using --rm.
# This preserves the interactive session for custom error sending.
docker run --name $containerName -it `
    -v $volumeMount `
    -w /workspace/terraform `
    $IMAGE_NAME `
    $FinalCMD

# After the interactive session ends, capture the exit code.
$exitCode = $LASTEXITCODE

# Retrieve the logs from the container (the output from the interactive session).
$output = docker logs $containerName | Out-String

# Remove the container now that we've captured its logs.
docker rm $containerName | Out-Null

# Now check if the command failed.
if ($exitCode -ne 0) {
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "The Terraform team caught this error. Please see the tips below!" -ForegroundColor Red
    Write-Host "========================================" -ForegroundColor Red
    Write-Host "TIPS:" -ForegroundColor Red

    # Custom error messages based on known patterns.
    if ($output -match "The following organization members have reached their maximum limits") {
         Write-Host " You have more than 1 active Supabase project in your organization." -ForegroundColor Red
    }
    elseif($output -match "The installed provider plugins are not consistent with") {
         Write-Host "Run terraform init or ./tf.ps1 init or ./tf.sh init."
    }
    elseif($output -match "Ably API token cannot be an empty string.") {
         Write-Host "Make sure you have followed the README instructions to create your tf.tfvars file."
    }
     elseif($output -match "Could not create resource, unexpected error") {
          Write-Host "You need to delete any ably app that uses the same ably access token."
     }
     elseif($output -match "Unable to create project") {
          Write-Host "You need to delete any supabase projects with the same name as the one you are creating."
     }
    elseif ($output -match "CRLF line endings detected") {
         Write-Host " The files listed above have CRLF line endings. Please change the line endings to LF." -ForegroundColor Red
    }
    elseif ($output -match "Failed to retrieve user details" -or $output -match "jwt malformed") {
         Write-Host "Check to make sure you correctly copied your supabase access token." -ForegroundColor Red
    }
    elseif($output -match "/me: Access denied: code 40100: status code: 401 see: https://help.ably.io/error/40100") {
         Write-Host "Check to make sure you correctly copied your ably access token."
    }
    elseif($output -match "/apps/o9BmWw/keys: Access denied: code 40100: status code: 401 see: https://help.ably.io/error/40100") {
        Write-Host "Check to make sure your ably access token has all permissions."
    }
    elseif($output -match "Failed to retrieve organization") {
         Write-Host "Check to make sure you correctly copied your supabase organization id."
    }
    elseif($output -match "Project status did not reach ACTIVE_HEALTHY within.") {
         Write-Host "If you had to time out the run of apply, check to make sure your supabase db password is correct."
    }
    else {
         Write-Host "We haven't handle this case yet: An unknown error occurred. Check to make sure Docker Desktop is running, and if that doesn't work, please review the output above. In most cases, this is due to out of sync terraform state. Please refer to the section of the README called SYNCING TERRAFORM STATE." -ForegroundColor Red
    }
    Write-Host "========================================" -ForegroundColor Red
    exit $exitCode
} 