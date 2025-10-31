#!/bin/sh
set -e

# Path to the static build directory
TARGET_PATH="/app/build"

echo "window.__ENV__ = {" > ${TARGET_PATH}/env-config.js

# Loop through all environment variables and add them to the JS file
for var in $(env | grep -E '^[A-Z_][A-Z0-9_]*=' | cut -d'=' -f1); do
  value=$(printenv "$var" | sed 's/"/\\"/g')
  echo "  \"$var\": \"$value\"," >> ${TARGET_PATH}/env-config.js
done

echo "};" >> ${TARGET_PATH}/env-config.js

echo "✅ Generated env-config.js:"
cat ${TARGET_PATH}/env-config.js

# Start your static server
exec serve -s build -l 3000
