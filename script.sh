#!/bin/bash

# Parameters
DOMAIN="$1"
TARGET_DOMAIN="$2"

# Constants
NGINX_DIRECTORY="/etc/nginx/sites-enabled"
#NGINX_DIRECTORY="./nginx"

# Function to update status via API
update_status() {
  local status="$1"
  local url="http://localhost:5642/$DOMAIN/proxy/$status"

  echo "Calling API URL: $url"
  curl -X PATCH "$url"
}

# Function to update error status via API
update_error_status() {
  local error_message="$1"
  local formatted_error="${error_message// /-}"
  update_status "$formatted_error"
}

# Check if NGINX config file exists
CONFIG_FILE="$NGINX_DIRECTORY/$DOMAIN"
if [ -f "$CONFIG_FILE" ]; then
    update_status "NGINX-config-exists"
else
    # Create NGINX config file
    cat <<EOF > "$CONFIG_FILE"
server {
  server_name $DOMAIN;
  set \$bucket "$TARGET_DOMAIN";

  sendfile on;
  location / {
    resolver 8.8.8.8;
    proxy_http_version 1.1;
    proxy_redirect off;
    proxy_set_header Connection "";
    proxy_set_header Authorization '';
    proxy_set_header Host \$bucket;
    proxy_set_header X-Real-IP \$remote_addr;
    proxy_set_header X-Forwarded-For \$proxy_add_x_forwarded_for;
    proxy_hide_header x-amz-id-2;
    proxy_hide_header x-amz-request-id;
    proxy_hide_header x-amz-meta-server-side-encryption;
    proxy_hide_header x-amz-server-side-encryption;
    proxy_hide_header Set-Cookie;
    proxy_ignore_headers Set-Cookie;
    proxy_intercept_errors on;
    add_header Cache-Control max-age=31536000;
    proxy_pass http://\$bucket;
  }
}
EOF
    update_status "NGINX-config-created"
fi

# Restart NGINX
if service nginx restart; then
    update_status "NGINX-restarted"
else
    update_status "NGINX-restart-failed"
    exit 1
fi

# Run Certbot and handle error
if output=$(certbot -d "$DOMAIN" 2>&1); then
    update_status "Certbot-succeeded"
else
    update_error_status "$output"
    exit 1
fi
