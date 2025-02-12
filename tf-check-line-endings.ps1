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
    $CMD        = "terraform $joinedArgs"
}

# 3) Docker run:
#    - Mount entire project at /workspace
#    - Set working directory to /workspace/terraform
#    - Run "bash -c '/workspace/check-line-endings.sh /workspace && $CMD'"
#      so if the CRLF check fails, it never proceeds to Terraform.
$volumeMount = "${PROJECT_DIR}:/workspace"

docker run --rm -it `
    -v $volumeMount `
    -w /workspace/terraform `
    $IMAGE_NAME `
    "/workspace/check-line-endings.sh /workspace && $CMD"
