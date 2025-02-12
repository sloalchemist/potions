#!/usr/bin/env bash
set -e  # Stop script if any command fails

echo "Checking if any files have CRLF endings... this may take a moment..."

# The first argument is the directory to scan; default to current dir
TARGET_DIR="${1:-.}"

# Find all .tf or .sh files under TARGET_DIR
files=$(find "$TARGET_DIR" -name node_modules -prune -o -type f \( -name "*.tf" -o -name "*.sh" \) -print)

found_crlf=false

for f in $files; do
  # grep for carriage return (0x0D)
  if grep -q $'\r' "$f"; then
    echo "ERROR: CRLF line endings detected in: $f"
    echo "Please convert them to LF and try again."
    found_crlf=true
  fi
done

if [ "$found_crlf" = true ]; then
  echo "Aborting due to CRLF line endings."
  exit 1  # Abort Docker run
fi

echo "No CRLF line endings found."
