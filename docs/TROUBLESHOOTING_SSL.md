# Troubleshooting SSL/TLS Certificate Issues

This guide helps diagnose and fix SSL certificate issues with Let's Encrypt and Certbot.

## Common Error: ACME Challenge Validation Failed

### Symptoms

```
Failed authorization procedure. mydatagpt.cloud (http-01): urn:ietf:params:acme:error:unauthorized :: 
The client lacks sufficient authorization :: Invalid response from 
http://mydatagpt.cloud/.well-known/acme-challenge/...
```

### Root Cause

The domain DNS points to Hostinger's server (212.1.209.155) instead of your VPS, so Let's Encrypt cannot access the ACME challenge file on your VPS.

### Solution

**Follow the [DNS Setup Guide](DNS_SETUP.md) to update your DNS records.**

## Diagnostic Steps

### Step 1: Check Current DNS Resolution

```bash
# From your local machine or any server
dig +short mydatagpt.cloud
dig +short www.mydatagpt.cloud
dig +short api.mydatagpt.cloud
```

**What to look for:**
- ❌ **Wrong:** `212.1.209.155` (Hostinger's shared hosting)
- ✅ **Correct:** Your VPS IP address

### Step 2: Check Server Response

```bash
# Check what server is responding
curl -I http://mydatagpt.cloud | grep -i server
```

**What to look for:**
- ❌ **Wrong:** `Server: LiteSpeed` (Hostinger)
- ✅ **Correct:** `Server: nginx` (Your VPS)

### Step 3: Test ACME Challenge Access

```bash
# First, create a test file on your VPS
echo "test123" | sudo tee /var/www/certbot/.well-known/acme-challenge/test

# Then, from any machine, try to access it
curl http://mydatagpt.cloud/.well-known/acme-challenge/test
```

**What to look for:**
- ❌ **Wrong:** 404 error or Hostinger default page
- ✅ **Correct:** `test123` displayed

### Step 4: Verify Nginx Configuration

On your VPS:

```bash
# Test nginx configuration
sudo nginx -t

# Check if nginx is listening on port 80
sudo netstat -tlnp | grep :80

# Check nginx logs for errors
sudo tail -f /var/log/nginx/error.log
```

### Step 5: Check Firewall Rules

```bash
# Verify firewall allows HTTP and HTTPS
sudo ufw status

# If ports 80/443 are not allowed, add them:
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp
```

## Detailed DNS Configuration

### What DNS Records Should Look Like

After configuration (replace `1.2.3.4` with your VPS IP):

```
Type    Name    Value           TTL     Status
----    ----    -----           ---     ------
A       @       1.2.3.4         3600    Active
A       www     1.2.3.4         3600    Active
A       api     1.2.3.4         3600    Active
```

### What to Remove/Update

**REMOVE or UPDATE these if they point to Hostinger:**

```
Type    Name    Value                   Action
----    ----    -----                   ------
A       @       212.1.209.155           UPDATE to VPS IP
CNAME   www     mydatagpt.cloud         DELETE or convert to A record
AAAA    @       2a02:...                DELETE if no IPv6 on VPS
```

### DNS Propagation Check

Use these online tools to verify DNS changes globally:

1. [WhatsMyDNS.net](https://www.whatsmydns.net/) - Check global DNS propagation
2. [DNS Checker](https://dnschecker.org/) - Multi-location DNS lookup
3. [Google DNS](https://dns.google/query?name=mydatagpt.cloud&type=A) - Google's public DNS view

## Complete Fix Procedure

### 1. Update DNS at Hostinger

**Detailed steps in [DNS_SETUP.md](DNS_SETUP.md)**

1. Login to Hostinger hPanel
2. Go to Domains → DNS Zone Editor
3. Select mydatagpt.cloud
4. Update A records:
   - `@ → YOUR_VPS_IP`
   - `www → YOUR_VPS_IP`
   - `api → YOUR_VPS_IP`
5. Delete old AAAA records (unless you have IPv6)
6. Disable any proxy/CDN features
7. Save changes

### 2. Wait for DNS Propagation

```bash
# Check every few minutes
watch -n 60 'dig +short mydatagpt.cloud'
```

**Timeline:**
- Minimum: 5-15 minutes
- Typical: 1-2 hours
- Maximum: 24-48 hours (rare)

### 3. Verify DNS Resolution

```bash
# All three should return your VPS IP
dig +short mydatagpt.cloud
dig +short www.mydatagpt.cloud
dig +short api.mydatagpt.cloud

# Verify server type
curl -I http://mydatagpt.cloud | grep -i server
```

### 4. Prepare ACME Challenge Directory

On your VPS:

```bash
# Ensure directory exists with proper permissions
sudo mkdir -p /var/www/certbot/.well-known/acme-challenge
sudo chmod -R 755 /var/www/certbot
sudo chown -R www-data:www-data /var/www/certbot
```

### 5. Verify Nginx Configuration

Check your nginx config includes:

```nginx
server {
    listen 80;
    server_name mydatagpt.cloud www.mydatagpt.cloud api.mydatagpt.cloud;

    location /.well-known/acme-challenge/ {
        root /var/www/certbot;
    }

    location / {
        return 301 https://$host$request_uri;
    }
}
```

Test and reload:

```bash
sudo nginx -t
sudo systemctl reload nginx
```

### 6. Run Certbot

```bash
# Request certificates for all domains
sudo certbot --nginx -d mydatagpt.cloud -d www.mydatagpt.cloud -d api.mydatagpt.cloud

# Or use certonly mode for manual nginx config
sudo certbot certonly --webroot -w /var/www/certbot \
  -d mydatagpt.cloud \
  -d www.mydatagpt.cloud \
  -d api.mydatagpt.cloud
```

### 7. Verify Certificate Installation

```bash
# List installed certificates
sudo certbot certificates

# Test certificate with SSL Labs
# Visit: https://www.ssllabs.com/ssltest/analyze.html?d=mydatagpt.cloud

# Quick local test
echo | openssl s_client -connect mydatagpt.cloud:443 -servername mydatagpt.cloud 2>/dev/null | openssl x509 -noout -dates
```

### 8. Set Up Auto-Renewal

```bash
# Test renewal process
sudo certbot renew --dry-run

# Certbot should already have a systemd timer, verify:
sudo systemctl status certbot.timer

# If not, add a cron job:
sudo crontab -e
# Add: 0 0,12 * * * certbot renew --quiet
```

## Docker-Specific Issues

If running nginx in Docker (as per docker-compose.yml):

### Mount Volume for Certificates

```yaml
services:
  nginx:
    volumes:
      - ./reverse-proxy/nginx.conf:/etc/nginx/nginx.conf
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
```

### Run Certbot in Docker

```bash
# Create certbot directories
mkdir -p certbot/conf certbot/www

# Run certbot via Docker
docker run -it --rm \
  -v $(pwd)/certbot/conf:/etc/letsencrypt \
  -v $(pwd)/certbot/www:/var/www/certbot \
  certbot/certbot certonly --webroot \
  -w /var/www/certbot \
  -d mydatagpt.cloud \
  -d www.mydatagpt.cloud \
  -d api.mydatagpt.cloud
```

### Auto-Renewal with Docker

Add to docker-compose.yml:

```yaml
services:
  certbot:
    image: certbot/certbot
    volumes:
      - ./certbot/conf:/etc/letsencrypt
      - ./certbot/www:/var/www/certbot
    entrypoint: "/bin/sh -c 'trap exit TERM; while :; do certbot renew; sleep 12h & wait $${!}; done;'"
```

## Quick Reference: Common Commands

```bash
# DNS Checks
dig +short mydatagpt.cloud
nslookup mydatagpt.cloud
host mydatagpt.cloud

# Server Checks
curl -I http://mydatagpt.cloud
curl -I https://mydatagpt.cloud
curl http://mydatagpt.cloud/.well-known/acme-challenge/test

# Nginx
sudo nginx -t
sudo systemctl status nginx
sudo systemctl reload nginx
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log

# Certbot
sudo certbot certificates
sudo certbot renew --dry-run
sudo certbot delete --cert-name mydatagpt.cloud
sudo certbot --nginx -d mydatagpt.cloud

# Firewall
sudo ufw status
sudo ufw allow 80/tcp
sudo ufw allow 443/tcp

# Docker
docker-compose ps
docker-compose logs nginx
docker-compose restart nginx
docker exec -it <nginx-container> nginx -t
```

## Still Having Issues?

### Check Certbot Logs

```bash
# View detailed logs
sudo tail -f /var/log/letsencrypt/letsencrypt.log

# Check for specific error messages
sudo grep -i error /var/log/letsencrypt/letsencrypt.log
```

### Common Error Messages and Solutions

#### "Connection refused"
- Nginx not running: `sudo systemctl start nginx`
- Firewall blocking port 80: `sudo ufw allow 80/tcp`
- Wrong port in nginx config

#### "Too many requests"
- Let's Encrypt rate limit hit (5 failures per hour, 50 certs per domain per week)
- Wait 1 hour and try again
- Use `--dry-run` flag for testing

#### "Timeout during connect"
- DNS hasn't propagated yet - wait longer
- Firewall blocking connections
- VPS not accessible from internet

#### "Invalid response"
- ACME challenge file not accessible
- Check nginx config location block
- Verify file permissions on /var/www/certbot

### Test Without SSL First

Before dealing with SSL, ensure basic HTTP works:

1. Remove HTTPS redirect from nginx config temporarily
2. Verify you can access http://mydatagpt.cloud
3. Verify ACME challenge directory is accessible
4. Only then attempt Certbot

### Manual Challenge File Test

```bash
# On VPS: Create test file
echo "manual-test" | sudo tee /var/www/certbot/.well-known/acme-challenge/test-manual

# From anywhere: Access it
curl http://mydatagpt.cloud/.well-known/acme-challenge/test-manual
# Should output: manual-test

# If this fails, your DNS or nginx config is wrong
```

## Need More Help?

1. Check [DNS_SETUP.md](DNS_SETUP.md) for detailed DNS configuration
2. Review [DEPLOYMENT_CHECKLIST.md](DEPLOYMENT_CHECKLIST.md) for deployment steps
3. Search [Let's Encrypt Community](https://community.letsencrypt.org/)
4. Check [Certbot Documentation](https://eff-certbot.readthedocs.io/)

## Prevention: Pre-Flight Checklist

Before requesting certificates, verify:

- [ ] DNS points to VPS (verify with `dig`)
- [ ] VPS responds to HTTP requests (verify with `curl`)
- [ ] Nginx is running and configured correctly
- [ ] ACME challenge directory exists and is accessible
- [ ] Firewall allows ports 80 and 443
- [ ] No rate limits have been hit recently
- [ ] Domain is not on any blacklists
