#!/bin/bash

# DNS Verification Script for mydatagpt.cloud
# This script helps verify that DNS records are correctly configured
# before attempting SSL certificate installation

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
DOMAIN="mydatagpt.cloud"
SUBDOMAINS=("www" "api")
EXPECTED_SERVER="nginx"
WRONG_IP="212.1.209.155" # Hostinger's IP

echo "=========================================="
echo "DNS Verification for ${DOMAIN}"
echo "=========================================="
echo ""

# Function to check DNS resolution
check_dns() {
    local hostname=$1
    echo -n "Checking DNS for ${hostname}... "
    
    # Get IP address
    IP=$(dig +short ${hostname} | tail -n1)
    
    if [ -z "$IP" ]; then
        echo -e "${RED}FAILED${NC} - No DNS record found"
        return 1
    elif [ "$IP" == "$WRONG_IP" ]; then
        echo -e "${RED}FAILED${NC} - Still pointing to Hostinger (${IP})"
        echo "   Action needed: Update DNS at Hostinger to point to your VPS"
        return 1
    else
        echo -e "${GREEN}OK${NC} - Resolves to ${IP}"
        return 0
    fi
}

# Function to check server response
check_server() {
    local hostname=$1
    echo -n "Checking HTTP server for ${hostname}... "
    
    # Get server header
    SERVER=$(curl -s -I http://${hostname} 2>/dev/null | grep -i "^server:" | cut -d' ' -f2 | tr -d '\r')
    
    if [ -z "$SERVER" ]; then
        echo -e "${YELLOW}WARNING${NC} - No response from server"
        echo "   This might be normal if nginx is not running yet"
        return 2
    elif [[ "$SERVER" == *"LiteSpeed"* ]]; then
        echo -e "${RED}FAILED${NC} - Hostinger is still responding (${SERVER})"
        echo "   Action needed: Wait for DNS propagation or check DNS settings"
        return 1
    elif [[ "$SERVER" == *"nginx"* ]]; then
        echo -e "${GREEN}OK${NC} - Your VPS nginx is responding"
        return 0
    else
        echo -e "${YELLOW}WARNING${NC} - Unexpected server: ${SERVER}"
        return 2
    fi
}

# Function to check ACME challenge access
check_acme() {
    local hostname=$1
    echo -n "Checking ACME challenge access for ${hostname}... "
    
    # Try to access ACME challenge directory
    STATUS=$(curl -s -o /dev/null -w "%{http_code}" http://${hostname}/.well-known/acme-challenge/)
    
    if [ "$STATUS" == "404" ] || [ "$STATUS" == "403" ]; then
        echo -e "${GREEN}OK${NC} - Directory accessible (HTTP ${STATUS})"
        echo "   Note: 404 or 403 is normal if no challenge file exists yet"
        return 0
    elif [ "$STATUS" == "000" ]; then
        echo -e "${YELLOW}WARNING${NC} - Cannot connect to server"
        return 2
    else
        echo -e "${YELLOW}WARNING${NC} - Unexpected status: HTTP ${STATUS}"
        return 2
    fi
}

# Track overall success
OVERALL_SUCCESS=0

# Check root domain
echo "=== Checking Root Domain ==="
check_dns "${DOMAIN}" || OVERALL_SUCCESS=1
check_server "${DOMAIN}" || OVERALL_SUCCESS=1
check_acme "${DOMAIN}" || true  # Don't fail on ACME warnings
echo ""

# Check subdomains
for subdomain in "${SUBDOMAINS[@]}"; do
    echo "=== Checking ${subdomain}.${DOMAIN} ==="
    check_dns "${subdomain}.${DOMAIN}" || OVERALL_SUCCESS=1
    check_server "${subdomain}.${DOMAIN}" || OVERALL_SUCCESS=1
    check_acme "${subdomain}.${DOMAIN}" || true  # Don't fail on ACME warnings
    echo ""
done

# Check for IPv6
echo "=== Checking IPv6 (AAAA) Records ==="
echo -n "Checking IPv6 for ${DOMAIN}... "
IPV6=$(dig +short AAAA ${DOMAIN})
if [ -z "$IPV6" ]; then
    echo -e "${GREEN}OK${NC} - No IPv6 record (as expected)"
elif [[ "$IPV6" == "2a02:"* ]]; then
    echo -e "${YELLOW}WARNING${NC} - Hostinger IPv6 still present: ${IPV6}"
    echo "   Action: Delete AAAA record unless you have IPv6 on your VPS"
else
    echo -e "${GREEN}OK${NC} - IPv6: ${IPV6}"
fi
echo ""

# Summary
echo "=========================================="
echo "Summary"
echo "=========================================="
if [ $OVERALL_SUCCESS -eq 0 ]; then
    echo -e "${GREEN}✓ All checks passed!${NC}"
    echo ""
    echo "Your DNS appears to be correctly configured."
    echo "You can now proceed with SSL certificate installation:"
    echo ""
    echo "  sudo certbot --nginx -d ${DOMAIN} -d www.${DOMAIN} -d api.${DOMAIN}"
    echo ""
    exit 0
else
    echo -e "${RED}✗ Some checks failed${NC}"
    echo ""
    echo "Please review the errors above and take the suggested actions."
    echo "Common issues:"
    echo "  1. DNS still points to Hostinger - Update DNS records"
    echo "  2. DNS propagation in progress - Wait 15-60 minutes"
    echo "  3. Nginx not running - Start nginx on your VPS"
    echo "  4. Firewall blocking - Allow ports 80 and 443"
    echo ""
    echo "For detailed instructions, see: docs/DNS_SETUP.md"
    echo "For troubleshooting, see: docs/TROUBLESHOOTING_SSL.md"
    echo ""
    exit 1
fi
