#!/bin/bash

# Function to renew certificate
renew_certificate() {
    local domain=$1
    sudo certbot renew --force-renewal --cert-name "$domain"
}

# Function to get certificate expiration date
get_certificate_expiration() {
    local domain=$1
    certbot certificates | grep -A 4 "Certificate Name: $domain" | grep "Expiry Date:" | awk '{print $3, $4, $5}' | sed 's/ (VALID:.*//'
}

# Function to get certificate status
get_certificate_status() {
    local domain=$1
    if certbot certificates | grep -q "Certificate Name: $domain"; then
        echo "active"
    else
        echo "inactive"
    fi
}

# Check if a domain is provided
if [ -z "$1" ]; then
    echo "No domain specified. Usage: $0 <domain>"
    exit 1
fi

domain="$1"

# Step 1: Renew the certificate
renew_certificate "$domain"

# Step 2: Get the new certificate status and expiration date
certificate_expiration=$(get_certificate_expiration "$domain")
certificate_status=$(get_certificate_status "$domain")

# Prepare JSON payload for PATCH request
json_payload=$(cat <<EOF
{
  "domain": "$domain",
  "certificateStatus": "$certificate_status",
  "expiryDate": "$certificate_expiration"
}
EOF
)

# Append JSON payload to the log file
log_file="renew_log.txt"
echo "Renewal payload for $domain:" >> "$log_file"
echo "$json_payload" >> "$log_file"
echo -e "\n" >> "$log_file"

# Step 3: Send PATCH request
#curl -X PATCH "http://localhost:5642" -H "Content-Type: application/json" -d "$json_payload"
