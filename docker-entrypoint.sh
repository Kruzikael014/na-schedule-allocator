#!/bin/sh

echo "Hello World" > /text.txt

echo "window.configs = {
  \"VITE_BACKEND_URL\": \"$VITE_BACKEND_URL\"
};" > /usr/share/nginx/html/config.js

exec "$@"