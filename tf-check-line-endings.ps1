Param(
    [Parameter(Mandatory=$false, ValueFromRemainingArguments=$true)]
    [String[]]$TerraformArgs
)

# 1. Define a function to check for CRLF line endings in .tf or .sh files
Function Ensure-LfLineEndings {
    Param(
        [string]$RootPath
    )

    $targetFiles = Get-ChildItem -Path $RootPath -Recurse -Include *.tf, *.sh -File

    foreach ($file in $targetFiles) {
        # Read raw text
        $content = Get-Content -Path $file.FullName -Raw
        if ($content -match "`r") {
            Write-Host "ERROR: CRLF line endings detected in: $($file.FullName)"
            exit 1
        }
    }
}

# 2. Project variables
$IMAGE_NAME = "my-terraform"
$DOCKERFILE = "Dockerfile.terraform"

# This should point to your project's root directory (one level above 'terraform/')
$PROJECT_DIR = (Get-Location).Path

# 3. Run the line-ending check before building/running Docker
Ensure-LfLineEndings -RootPath $PROJECT_DIR

# 4. Build the Docker image (optional if frequently done)
docker build -t $IMAGE_NAME -f $DOCKERFILE .

# 5. Build the Terraform command
if (-not $TerraformArgs) {
    $CMD = "terraform init && terraform apply"
} else {
    $joinedArgs = $TerraformArgs -join " "
    $CMD        = "terraform $joinedArgs"
}

# 6. Run the container
# -v => mount entire project
# -w => set working directory inside container
$volumeMount = "${PROJECT_DIR}:/workspace"
docker run --rm -it `
    -v $volumeMount `
    -w /workspace/terraform `
    $IMAGE_NAME `
    $CMD
