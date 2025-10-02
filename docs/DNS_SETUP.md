# DNS Configuration Guide for mydatagpt.cloud

This guide explains how to configure DNS records at Hostinger to point your domain to your VPS for proper SSL/TLS certificate validation and application deployment.

## Problem Statement

Currently, the domain `mydatagpt.cloud` resolves to Hostinger's shared hosting server (212.1.209.155), which means:
- Let's Encrypt validation requests reach Hostinger, not your VPS
- Certbot cannot validate ACME challenges placed on your VPS
- SSL certificates cannot be issued or renewed
- Your application on the VPS is not accessible via the domain

## Solution: Update DNS Records at Hostinger

### Prerequisites

Before starting, you need:
- Your VPS public IPv4 address (the IP you use to SSH into your server)
- Access to your Hostinger hPanel account
- (Optional) Your VPS IPv6 address if IPv6 is configured

### Step-by-Step Instructions

#### 1. Login to Hostinger DNS Management

1. Go to [Hostinger hPanel](https://hpanel.hostinger.com/)
2. Navigate to: **Domains** → **DNS Zone Editor**
3. Select your domain: `mydatagpt.cloud`

#### 2. Update DNS Records

Replace `VPS_IP` in the examples below with your actual VPS IPv4 address.

##### A. Update Root Domain (@)

Find the A record for `@` (root domain) and update it:

```
Type: A
Name: @
Value: VPS_IP
TTL: 3600 (or default)
```

**Before:** `A @ → 212.1.209.155` (Hostinger)  
**After:** `A @ → VPS_IP` (Your VPS)

##### B. Update WWW Subdomain

Option 1 - If there's an existing A record for `www`:
```
Type: A
Name: www
Value: VPS_IP
TTL: 3600 (or default)
```

Option 2 - If there's a CNAME record for `www → mydatagpt.cloud`:
- Delete the CNAME record
- Add a new A record:
```
Type: A
Name: www
Value: VPS_IP
TTL: 3600 (or default)
```

**Note:** Both approaches work. A records are generally faster and more direct.

##### C. Update API Subdomain

If your Node backend runs on the same VPS (most common setup):
```
Type: A
Name: api
Value: VPS_IP
TTL: 3600 (or default)
```

If your API backend runs on a different host, use that host's IP instead.

##### D. Handle IPv6 (AAAA Records)

**If you do NOT have IPv6 configured on your VPS:**
- Delete the existing AAAA record for `@` (example: `2a02:...`)
- This prevents connection attempts to a non-working IPv6 address

**If you DO have IPv6 configured on your VPS:**
- Update the AAAA record to point to your VPS IPv6 address:
```
Type: AAAA
Name: @
Value: YOUR_VPS_IPV6_ADDRESS
TTL: 3600 (or default)
```

#### 3. Disable Hostinger Proxy/CDN

Ensure that no Hostinger proxy, CDN, or similar feature is enabled for these records:
- Look for any "proxy" toggle or "orange cloud" icon next to the DNS records
- Set all records to **DNS-only** mode (not proxied)
- This ensures ACME challenge requests reach your VPS directly

#### 4. Save Changes

Click **Save** or **Update** to apply your DNS changes.

## Why This Fixes the Issue

After updating DNS records:
1. DNS queries for `mydatagpt.cloud`, `www.mydatagpt.cloud`, and `api.mydatagpt.cloud` will resolve to your VPS IP
2. Let's Encrypt validation requests will reach your VPS where nginx and ACME challenge files are located
3. Certbot can successfully validate domain ownership and issue SSL certificates
4. Visitors will reach your application running on the VPS instead of Hostinger's default page

## Verification Steps

After updating DNS (wait 5-15 minutes for propagation), verify the changes.

### Automated Verification (Recommended)

Use the provided verification script for comprehensive checks:

```bash
./scripts/verify-dns.sh
```

This script automatically checks DNS resolution, server responses, and ACME challenge accessibility. See [scripts/README.md](../scripts/README.md) for details.

### Manual Verification

Alternatively, manually verify each component:

#### 1. Check DNS Resolution

From your local machine or VPS, run:

```bash
# Check root domain
dig +short mydatagpt.cloud

# Check www subdomain
dig +short www.mydatagpt.cloud

# Check api subdomain
dig +short api.mydatagpt.cloud
```

Expected output: All should return your VPS IP address (VPS_IP).

#### 2. Verify HTTP Response

```bash
# Check if requests reach your VPS
curl -I http://mydatagpt.cloud

# Check for nginx server header (should be "nginx", not "LiteSpeed")
curl -I http://mydatagpt.cloud | grep -i server
```

Expected: You should see `Server: nginx` in the response headers, not `Server: LiteSpeed`.

#### 3. Test ACME Challenge Access

If you have a test file in the ACME challenge directory:

```bash
curl http://mydatagpt.cloud/.well-known/acme-challenge/test
```

This should reach your VPS and return the test file content.

#### 4. Run Certbot

Once DNS is verified, request or renew SSL certificates:

```bash
# On your VPS
sudo certbot --nginx -d mydatagpt.cloud -d www.mydatagpt.cloud -d api.mydatagpt.cloud
```

Certbot should now successfully validate and issue certificates.

## DNS Propagation Timeline

- **Minimum:** 5-15 minutes
- **Typical:** 1-2 hours
- **Maximum:** 24-48 hours (rare)

Use online tools to check propagation globally:
- [WhatsMyDNS.net](https://www.whatsmydns.net/)
- [DNS Checker](https://dnschecker.org/)

## Common Issues

### Issue: DNS still points to old IP after hours

**Solution:**
- Clear your local DNS cache:
  ```bash
  # Linux
  sudo systemd-resolve --flush-caches
  
  # macOS
  sudo dscacheutil -flushcache; sudo killall -HUP mDNSResponder
  
  # Windows
  ipconfig /flushdns
  ```
- Check DNS from different networks or use online DNS checkers
- Verify TTL value isn't set too high (shouldn't exceed 3600 for changes)

### Issue: Mixed results from different DNS servers

**Solution:**
- This is normal during propagation
- Wait for TTL expiration (check the TTL value of old records)
- Once propagation completes, all servers will return the new IP

### Issue: Certificate validation still fails

**Solution:**
1. Verify DNS actually points to VPS (use `dig` commands above)
2. Ensure nginx is running and listening on port 80
3. Check firewall allows HTTP/HTTPS traffic:
   ```bash
   sudo ufw status
   sudo ufw allow 80/tcp
   sudo ufw allow 443/tcp
   ```
4. Verify the ACME challenge directory exists and is readable:
   ```bash
   ls -la /var/www/certbot/.well-known/acme-challenge/
   ```

## Next Steps After DNS Configuration

1. **Wait for DNS propagation** (5-15 minutes minimum)
2. **Verify DNS changes** using the verification steps above
3. **Run Certbot** to obtain SSL certificates
4. **Test your application** access via HTTPS
5. **Set up certificate auto-renewal** with cron or systemd timer

## Related Files

- `/reverse-proxy/nginx.conf` - Nginx configuration for reverse proxy
- `/reverse-proxy/Dockerfile` - Nginx container with Certbot
- `/docker-compose.yml` - Docker services configuration
- `/fix_nginx.py` - Script to update nginx configuration

## Additional Resources

- [Let's Encrypt Documentation](https://letsencrypt.org/docs/)
- [Certbot Documentation](https://certbot.eff.org/docs/)
- [Nginx Documentation](https://nginx.org/en/docs/)
- [Hostinger DNS Management Guide](https://support.hostinger.com/en/articles/1696802-how-to-edit-dns-zone)
