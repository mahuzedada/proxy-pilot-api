#!/bin/bash

# Step 1: Run 'sudo certbot certificates' and save the output
certbot_output_file="certbot_status.txt"
sudo certbot certificates > "$certbot_output_file"

# Function to extract certificate expiration for a domain
get_certificate_expiration() {
    local domain=$1
    local expiry_line=$(grep -A 4 "Domains: $domain" "$certbot_output_file" | grep "Expiry Date:")
    echo $expiry_line | awk '{print $3, $4, $5}' | sed 's/ (VALID:.*//' | sed 's/ (INVALID:.*//'
}

# Function to extract certificate status for a domain
get_certificate_status() {
    local domain=$1
    local expiry_info=$(grep -A 4 "Domains: $domain" "$certbot_output_file" | grep "Expiry Date:")
    if [[ $expiry_info == *"INVALID"* ]]; then
        echo "inactive"
    else
        echo "active"
    fi
}

# Output file for logging
log_file="postDomains.txt"
# Clear the file if it already exists
> "$log_file"

# Step 2: Read each domain configuration
for file in /etc/nginx/sites-enabled/*; do
    # Extracting domain and target_domain
    domain=$(grep "server_name" "$file" | awk '{print $2}' | tr -d ';' | head -n 1)
    target_domain=$(grep 'set $bucket' "$file" | awk -F\" '{print $2}' | head -n 1)

    # Skip if domain or target_domain is empty
    if [ -z "$domain" ] || [ -z "$target_domain" ]; then
        continue
    fi

    # Step 3: Get certificate status and expiration date
    certificate_expiration=$(get_certificate_expiration "$domain")
    certificate_status=$(get_certificate_status "$domain")

    # Prepare JSON payload
    json_payload=$(cat <<EOF
{
  "domain": "$domain",
  "target_domain": "$target_domain",
  "user_id": "83396b1d-80fa-4b8d-a0a3-6292ac7683a9",
  "certificate_expiration": "$certificate_expiration",
  "certificate_status": "$certificate_status",
  "proxy_status": "active"
}
EOF
)

    # Step 4: Log and Make a POST request to the API
    echo "Sending POST request for domain: $domain" >> "$log_file"
    echo "$json_payload" >> "$log_file"

    response=$(curl -s -o response.txt -w "%{http_code}" -X POST "http://localhost:5642/skip-setup" -H "Content-Type: application/json" -d "$json_payload")

    # Log response and status code
    echo "Response Code: $response" >> "$log_file"
    echo "Response Body:" >> "$log_file"
    cat response.txt >> "$log_file"
    echo -e "\n\n" >> "$log_file"

    # Cleanup the response file
    rm -f response.txt
done
