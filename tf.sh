#!/usr/bin/env bash

IMAGE_NAME="my-terraform"
DOCKERFILE="Dockerfile.terraform"

# Absolute path to project root (the directory containing 'terraform/' and 'packages/')
PROJECT_DIR="$(pwd)"  

# Build the image (optional if you do it often)
docker build -t "$IMAGE_NAME" -f "$DOCKERFILE" .

# If no arguments are passed, default to 'init && apply'
if [ $# -eq 0 ]; then
  CMD="terraform init && terraform apply"
else
  CMD="terraform $*"
fi

# Run
# NOTE: We mount the entire project at /workspace
#       and then set the workdir to /workspace/terraform
docker run --rm -it \
  -v "$PROJECT_DIR":/workspace \
  -w /workspace/terraform \
  "$IMAGE_NAME" \
  "$CMD"
