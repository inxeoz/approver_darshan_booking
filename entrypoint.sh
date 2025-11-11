#!/bin/sh
set -e

# Load .env file if exists
if [ -f ".env" ]; then
  while IFS='=' read -r key value; do
    export "$key"="$value"
  done < .env
fi

# Path to the static build directory
if [ -d "/app" ]; then
  TARGET_PATH="/app/build"
else
  TARGET_PATH="./build"
fi

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
