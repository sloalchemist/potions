#!/usr/bin/env bash

IMAGE_NAME="my-terraform"
DOCKERFILE="Dockerfile.terraform"

# Absolute path to project root (the directory containing 'terraform/' and 'packages/')
PROJECT_DIR="$(pwd)"  

# Build the image (optional if you do it frequently)
docker build -t "$IMAGE_NAME" -f "$DOCKERFILE" .

# If no arguments are passed, default to 'init && apply'
if [ $# -eq 0 ]; then
  CMD="terraform init && terraform apply"
else
  CMD="terraform $*"
fi

# Run container
docker run --rm -it \
  -v "$PROJECT_DIR":/workspace \
  -w /workspace/terraform \
  "$IMAGE_NAME" \
  "/workspace/check-line-endings.sh /workspace && ${CMD}"
