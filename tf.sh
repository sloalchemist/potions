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

# Generate a unique container name so we can capture logs later.
# Use uuidgen if available; otherwise, fallback to a random number.
containerName="terraform-temp-$(uuidgen 2>/dev/null || echo $RANDOM)"

# Run container
docker run --name "$containerName" -it \
  -v "$PROJECT_DIR":/workspace \
  -w /workspace/terraform \
  "$IMAGE_NAME" \
  "/workspace/check-line-endings.sh /workspace && ${CMD}"

# Capture the exit code of the docker run.
exitCode=$?

# Retrieve the logs from the container (this captures all output from the session).
output=$(docker logs "$containerName")

# Remove the container now that we've captured its logs.
docker rm "$containerName" > /dev/null

# If the Terraform command failed, display error information.
if [ $exitCode -ne 0 ]; then
    echo -e "\033[31m========================================\033[0m"
    echo -e "\033[31mThe Terraform team caught this error. Please see the tips below!\033[0m"
    echo -e "\033[31m========================================\033[0m"
    echo -e "\033[31mTIPS:\033[0m"
    
    # Custom error messages based on known patterns.
    if echo "$output" | grep -q "The following organization members have reached their maximum limits"; then
         echo -e "\033[31mYou have more than 1 active Supabase project in your organization.\033[0m"
    elif echo "$output" | grep -q "CRLF line endings detected"; then
         echo -e "\033[31mThe files listed above have CRLF line endings. Please change the line endings to LF.\033[0m"
    elif echo "$output" | grep -q "Failed to retrieve user details\|jwt malformed"; then
         echo -e "\033[31mCheck to make sure you correctly copied your supabase access token.\033[0m"
    elif echo "$output" | grep -q "/me: Access denied: code 40100: status code: 401 see: https://help.ably.io/error/40100"; then
         echo -e "\033[31mCheck to make sure you correctly copied your ably access token.\033[0m"
    elif echo "$output" | grep -q "/apps/o9BmWw/keys: Access denied: code 40100: status code: 401 see: https://help.ably.io/error/40100"; then
         echo -e "\033[31mCheck to make sure your ably access token has all permissions.\033[0m"
    elif echo "$output" | grep -q "Failed to retrieve organization"; then
         echo -e "\033[31mCheck to make sure you correctly copied your supabase organization id.\033[0m"
    elif echo "$output" | grep -q "Project status did not reach ACTIVE_HEALTHY within."; then
         echo -e "\033[31mIf you had to time out the run of apply, check to make sure your supabase db password is correct.\033[0m"
    elif echo "$output" | grep -q "Ably API token cannot be an empty string."; then
         echo -e "\033[31mMake sure you have followed the README instructions to create your tf.tfvars file.\033[0m"
    else
         echo -e "\033[31mWe haven't handle this case yet: An unknown error occurred. Check to make sure Docker Desktop is running, and if that doesn't work, please review the output above. In most cases, this is due to out of sync terraform state. Please refer to the section of the README called SYNCING TERRAFORM STATE.\033[0m"
    fi
    exit $exitCode
fi