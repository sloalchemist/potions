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
    echo
    echo "ERROR: CRLF line endings detected in: $f"
    echo
    echo "Please convert them to LF and try again."
    echo
    echo "You will need to cleanly pull the repo by running the following commands"
    echo "(these will remove any uncommitted changes so make sure to commit or stash them):"
    echo
    echo "On main run:"
    echo "\`git fetch\`"
    echo "\`git pull\`"
    echo "\`git rm --cached -r .\`"
    echo "\`git reset --hard\`"
    echo
    echo "Refer to the 'Note for Windows' under Terraform in the README for more information."
    echo
    found_crlf=true
  fi
done

if [ "$found_crlf" = true ]; then
  echo "Aborting due to CRLF line endings."
  exit 1  # Abort Docker run
fi

echo "No CRLF line endings found."
