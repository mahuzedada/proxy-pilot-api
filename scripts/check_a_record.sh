#!/bin/bash

# Get the domain from the user
DOMAIN="$1"

# Get the server's public IP address
SERVER_IP=$(curl -s http://ipecho.net/plain)

# Perform a DNS lookup to get the A record for the domain
DOMAIN_IP=$(dig +short A $DOMAIN)

# Check if the A record matches the server's IP
if [[ $DOMAIN_IP == $SERVER_IP ]]; then
    echo "The A record for $DOMAIN correctly points to this server."
else
    echo "The A record for $DOMAIN does not point to this server."
    exit 1
fi
