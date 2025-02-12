#!/usr/bin/env bash

# -----------------------------
# 1. FUNCTION TO ENSURE LF ENDINGS
# -----------------------------
ensure_lf_line_endings() {
  local project_dir="$1"
  local found_crlf=false

  # Find all *.tf, *.sh, (and *.tfvars if desired) files
  while IFS= read -r -d '' file; do
    # Use grep in binary mode to find carriage returns
    #   $'\r' is a Bash-quoted literal carriage return.
    if LC_ALL=C grep -q $'\r' "$file"; then
      echo "ERROR: CRLF line endings detected in: $file"
      echo "Please convert them to LF (Unix) line endings."
      found_crlf=true
    fi
  done < <(find "$project_dir" -type f \( -name '*.tf' -o -name '*.sh' -o -name '*.tfvars' \) -print0)

  if [ "$found_crlf" = true ]; then
    echo "One or more files have CRLF. Aborting."
    exit 1
  fi
}

# -----------------------------
# 2. MAIN SCRIPT
# -----------------------------
IMAGE_NAME="my-terraform"
DOCKERFILE="Dockerfile.terraform"

# Absolute path to project root (the directory containing 'terraform/' and 'packages/')
PROJECT_DIR="$(pwd)"  

# RUN CRLF CHECK FIRST
ensure_lf_line_endings "$PROJECT_DIR"

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
  "$CMD"
