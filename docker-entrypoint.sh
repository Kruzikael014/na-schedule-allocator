#!/bin/sh

echo "i was here" >> /usr/share/nginx/html/hello 

echo "window.configs = {
  \"VITE_BACKEND_URL\": \"$VITE_BACKEND_URL\"
};" > /usr/share/nginx/html/config.js

exec "$@"