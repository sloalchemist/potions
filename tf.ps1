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
    $CMD        = "terraform $joinedArgs"
}

# Run the container
# - Mount the entire project at /workspace
# - Workdir set to /workspace/terraform
$volumeMount = "${PROJECT_DIR}:/workspace"
docker run --rm -it `
    -v $volumeMount `
    -w /workspace/terraform `
    $IMAGE_NAME `
    $CMD
