#!/bin/sh
set -e

while [ ! -f /usr/share/nginx/html/index.html ]; do
  echo "Waiting for frontend build..."
  sleep 2
done

if [ ! -f /etc/nginx/ssl/cert.pem ] || [ ! -f /etc/nginx/ssl/key.pem ]; then
  echo "Generating self-signed SSL certificate..."
  mkdir -p /etc/nginx/ssl
  openssl req -x509 -nodes -days 365 -newkey rsa:2048 \
    -keyout /etc/nginx/ssl/key.pem \
    -out /etc/nginx/ssl/cert.pem \
    -subj "/CN=localhost"
fi

exec /docker-entrypoint.sh nginx -g "daemon off;"
