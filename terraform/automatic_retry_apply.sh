#!/usr/bin/env bash

# Check if terraform is installed
if ! command -v terraform &> /dev/null; then
    echo "Error: terraform is not installed or not in PATH. You can download it here: https://developer.hashicorp.com/terraform/install?product_intent=terraform"
    exit 1
fi

# Configuration
MAX_ATTEMPTS=10
SLEEP_SECONDS=20

# Bail on errors *in this script* except where we explicitly handle them
set -eo pipefail

echo "This script exists because Supabase likes to take it's sweet time spinning up the database pooler, and terraform seems to have no way to handle this. As a result, this script will run terraform apply in a loop until it succeeds. It typically takes between 1 and 3 minutes"

for i in $(seq 1 $MAX_ATTEMPTS); do
  echo "====== Attempt $i of $MAX_ATTEMPTS ======"

  # Capture Terraform's stdout/stderr into APPLY_OUTPUT
  APPLY_OUTPUT="$(terraform apply -auto-approve 2>&1 || true)"

  # Print the entire output so we can see if there's any error
  # echo "$APPLY_OUTPUT"

  # If Terraform truly succeeded, typically exit code is 0, but we can't rely on that
  # alone because we know the provider might be returning code 0 while printing an error.
  APPLY_EXIT_CODE=$?

  # Check the output for the specific error text that indicates the supabase_pooler transaction is missing.
  # Feel free to add or remove patterns to match the exact messages you're seeing.
  if echo "$APPLY_OUTPUT" | grep -q "Error: Invalid index"; then
    echo "Detected 'Invalid index' error in Terraform output. Retrying..."
  elif echo "$APPLY_OUTPUT" | grep -q "The given key does not identify an element in this collection value"; then
    echo "Detected 'key does not identify an element' error in Terraform output. Retrying..."
  elif echo "$APPLY_OUTPUT" | grep -q "Error:"; then
    # Optionally, treat *any* "Error:" line as a reason to retry
    echo "Detected an Error in Terraform output. Retrying..."
  elif echo "$APPLY_OUTPUT" | grep -q "Apply complete!"; then
    echo "Terraform apply completed successfully!"
    exit 0
  else
    # Unknown situation - output the terraform result and continue retrying
    echo "Unknown terraform output - neither success nor known error detected. Output follows:"
    echo "$APPLY_OUTPUT"
    echo "====Stopping retry loop===="
    exit 1
  fi

  echo "Waiting $SLEEP_SECONDS seconds before next attempt..."
  sleep "$SLEEP_SECONDS"
done

echo "ERROR: Failed to successfully apply terraform after $MAX_ATTEMPTS attempts."
exit 1
