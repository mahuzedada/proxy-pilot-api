#!/bin/bash

# Function to renew certificate
renew_certificate() {
    local domain=$1
    echo "ABOUT TO RENEW CERTBOT"
    certbot renew --force-renewal --cert-name "$domain"
    echo "CERTBOT RENEWED"
}

# Step 1: Run 'certbot certificates' and save the output
certbot_output_file="certbot_status.txt"
certbot certificates > "$certbot_output_file"

# Function to extract certificate expiration for a domain
get_certificate_expiration() {
    echo "ABOUT TO get_certificate_expiration"
    local domain=$1
    local expiry_line=$(grep -A 4 "Domains: $domain" "$certbot_output_file" | grep "Expiry Date:")
    echo $expiry_line | awk '{print $3, $4, $5}' | sed 's/ (VALID:.*//' | sed 's/ (INVALID:.*//'
    echo "get_certificate_expiration DONE"
}

# Function to extract certificate status for a domain
get_certificate_status() {
    echo "ABOUT TO get_certificate_status"
    local domain=$1
    local expiry_info=$(grep -A 4 "Domains: $domain" "$certbot_output_file" | grep "Expiry Date:")
    if [[ $expiry_info == *"INVALID"* ]]; then
        echo "inactive"
    else
        echo "active"
    fi
    echo "get_certificate_status DONE"
}

# Check if a domain is provided
if [ -z "$1" ]; then
    echo "No domain specified. Usage: $0 <domain>"
    exit 1
fi

domain="$1"

# Step 2: Renew the certificate
renew_certificate "$domain"

# Step 3: Get the new certificate status and expiration date
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

# Step 4: Send PATCH request
curl -X PATCH "http://localhost:5642" -H "Content-Type: application/json" -d "$json_payload"
