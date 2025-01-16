#!/usr/bin/env bash

# Configuration
MAX_ATTEMPTS=10
SLEEP_SECONDS=10

# Bail on errors *in this script* except where we explicitly handle them
set -eo pipefail

for i in $(seq 1 $MAX_ATTEMPTS); do
  echo "====== Attempt $i of $MAX_ATTEMPTS ======"

  # Capture Terraform's stdout/stderr into APPLY_OUTPUT
  APPLY_OUTPUT="$(terraform apply -auto-approve 2>&1 || true)"

  # Print the entire output so we can see if there's any error
  #echo "$APPLY_OUTPUT"

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
  else
    # No known error found in output => consider it a success
    echo "Terraform apply output does not show the known error. Assuming success."
    exit 0
  fi

  echo "Waiting $SLEEP_SECONDS seconds before next attempt..."
  sleep "$SLEEP_SECONDS"
done

echo "ERROR: Still seeing 'Invalid index' or missing transaction after $MAX_ATTEMPTS attempts."
exit 1
