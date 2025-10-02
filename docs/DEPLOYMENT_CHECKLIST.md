# Deployment Checklist for mydatagpt.cloud

Quick reference checklist for deploying MyDataGPT to production.

## Pre-Deployment Checklist

- [ ] VPS server provisioned and accessible via SSH
- [ ] Docker and Docker Compose installed on VPS
- [ ] Domain registered (mydatagpt.cloud)
- [ ] DNS access to domain registrar/hosting (Hostinger)
- [ ] Firewall configured to allow HTTP (80) and HTTPS (443)
- [ ] All environment variables configured
- [ ] Firebase project set up and credentials available

## DNS Configuration (Critical for SSL)

**Follow the detailed guide:** [DNS_SETUP.md](./DNS_SETUP.md)

### Quick DNS Update Steps (Hostinger)

1. Login to Hostinger hPanel → Domains → DNS Zone Editor
2. Update these records to point to your VPS IP:
   - `A @ → VPS_IP`
   - `A www → VPS_IP`
   - `A api → VPS_IP`
3. Delete AAAA records if no IPv6 on VPS
4. Disable any proxy/CDN features
5. Save changes

### Verification Commands

```bash
# Wait 5-15 minutes, then verify:
dig +short mydatagpt.cloud        # Should show VPS_IP
dig +short www.mydatagpt.cloud    # Should show VPS_IP
dig +short api.mydatagpt.cloud    # Should show VPS_IP

# Check server header
curl -I http://mydatagpt.cloud | grep -i server  # Should show "nginx"
```

## SSL Certificate Setup

- [ ] DNS propagated and verified (see above)
- [ ] Nginx running and accessible on port 80
- [ ] ACME challenge directory created: `/var/www/certbot/.well-known/acme-challenge/`
- [ ] Run Certbot:
  ```bash
  sudo certbot --nginx -d mydatagpt.cloud -d www.mydatagpt.cloud -d api.mydatagpt.cloud
  ```
- [ ] Verify certificates issued successfully
- [ ] Test HTTPS access
- [ ] Set up auto-renewal cron job

## Application Deployment

### 1. Clone Repository on VPS

```bash
cd /home/mastenmind
git clone https://github.com/JOHNNYWHITEMIKE/mydatagpt.git
cd mydatagpt
```

### 2. Configure Environment Variables

```bash
# Create .env file with necessary variables
cp .env.example .env
nano .env
```

Required variables:
- Firebase credentials
- MinIO access keys
- Database credentials
- API keys

### 3. Build and Start Services

```bash
# Build Docker images
docker-compose build

# Start services
docker-compose up -d

# Check service status
docker-compose ps
docker-compose logs -f
```

### 4. Verify Services

- [ ] Nginx reverse proxy running
- [ ] Personal backend accessible
- [ ] ChatGPT backend accessible
- [ ] Frontend accessible
- [ ] MinIO storage accessible
- [ ] PostgreSQL database running

### 5. Test Application

- [ ] Access https://mydatagpt.cloud
- [ ] Test user registration
- [ ] Test file upload
- [ ] Test ChatGPT interaction
- [ ] Test authentication flow
- [ ] Test on mobile devices

## Post-Deployment

### Monitoring

- [ ] Set up logging
- [ ] Configure monitoring/alerting
- [ ] Set up backup scripts
- [ ] Document incident response procedures

### Maintenance

- [ ] Schedule regular backups
- [ ] Set up certificate auto-renewal monitoring
- [ ] Plan for updates and patches
- [ ] Document rollback procedures

### Security

- [ ] Review firewall rules
- [ ] Enable fail2ban or similar
- [ ] Set up regular security audits
- [ ] Review and rotate API keys
- [ ] Enable rate limiting
- [ ] Set up SSL/TLS configuration (A+ rating)

## Troubleshooting

### DNS Issues

- **Problem:** Domain still points to old IP
  - **Solution:** Check TTL, wait for propagation, flush local DNS cache

- **Problem:** Mixed DNS results
  - **Solution:** Normal during propagation, wait for TTL expiration

### SSL Issues

- **Problem:** Certbot validation fails
  - **Solution:** Verify DNS points to VPS, check nginx config, verify ACME directory

- **Problem:** Certificate not trusted
  - **Solution:** Verify full certificate chain installed, check intermediate certificates

### Application Issues

- **Problem:** Services not starting
  - **Solution:** Check Docker logs, verify environment variables, check port conflicts

- **Problem:** 502 Bad Gateway
  - **Solution:** Verify backend services running, check docker network connectivity

- **Problem:** CORS errors
  - **Solution:** Update nginx configuration with proper CORS headers

## Quick Commands Reference

```bash
# Docker
docker-compose up -d          # Start services
docker-compose down           # Stop services
docker-compose logs -f        # View logs
docker-compose ps             # List services
docker-compose restart        # Restart all services

# Nginx
sudo nginx -t                 # Test configuration
sudo systemctl restart nginx  # Restart nginx
sudo tail -f /var/log/nginx/error.log  # View error logs

# Certbot
sudo certbot renew --dry-run  # Test renewal
sudo certbot certificates     # List certificates
sudo certbot renew            # Renew certificates

# DNS
dig +short <domain>           # Quick DNS lookup
nslookup <domain>             # Detailed DNS info
host <domain>                 # Simple DNS query

# Firewall
sudo ufw status               # Check firewall
sudo ufw allow 80/tcp         # Allow HTTP
sudo ufw allow 443/tcp        # Allow HTTPS
```

## Support and Resources

- **DNS Setup Guide:** [DNS_SETUP.md](./DNS_SETUP.md)
- **Architecture:** [blueprint.md](./blueprint.md)
- **Repository:** https://github.com/JOHNNYWHITEMIKE/mydatagpt
- **Let's Encrypt Status:** https://letsencrypt.status.io/
- **SSL Test:** https://www.ssllabs.com/ssltest/

## Emergency Contacts

Document your emergency contacts and procedures:
- VPS hosting provider support
- DNS provider support (Hostinger)
- Domain registrar support
- Team contact information
