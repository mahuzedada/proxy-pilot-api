#!/bin/bash

# Check if a domain is provided as an argument
if [ $# -eq 0 ]; then
    echo "No domain provided. Usage: $0 <domain>"
    exit 1
fi

DOMAIN=$1

# Step 1: Revoke the SSL certificate using certbot
certbot revoke --cert-name $DOMAIN --delete-after-revoke

# Check if certbot revoke was successful
if [ $? -ne 0 ]; then
    echo "Failed to revoke SSL certificate for $DOMAIN"
    exit 1
fi

# Step 2: Remove the Nginx configuration file for the domain
NGINX_CONF="/etc/nginx/sites-enabled/$DOMAIN"

if [ -f "$NGINX_CONF" ]; then
    rm -f $NGINX_CONF
    echo "Removed Nginx configuration for $DOMAIN"
else
    echo "Nginx configuration for $DOMAIN does not exist"
fi

# Step 3: Restart Nginx to apply changes
service nginx restart

# Check if nginx restart was successful
if [ $? -ne 0 ]; then
    echo "Failed to restart Nginx"
    exit 1
fi
