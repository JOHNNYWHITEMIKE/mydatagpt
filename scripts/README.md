# Deployment and Verification Scripts

This directory contains helper scripts for deploying and verifying the MyDataGPT application.

## Available Scripts

### verify-dns.sh

A comprehensive DNS verification script that checks if your domain is correctly configured before attempting SSL certificate installation.

**Usage:**

```bash
./scripts/verify-dns.sh
```

**What it checks:**

- DNS resolution for `mydatagpt.cloud`, `www.mydatagpt.cloud`, and `api.mydatagpt.cloud`
- Whether DNS still points to Hostinger (old IP: 212.1.209.155)
- HTTP server response headers (should be nginx, not LiteSpeed)
- ACME challenge directory accessibility
- IPv6 (AAAA) records

**When to use:**

- After updating DNS records at Hostinger
- Before running Certbot to obtain SSL certificates
- To troubleshoot SSL certificate issues
- To verify DNS propagation is complete

**Output:**

The script provides color-coded output:
- 🟢 Green: Check passed
- 🟡 Yellow: Warning (may not be critical)
- 🔴 Red: Check failed (action needed)

**Example output:**

```
==========================================
DNS Verification for mydatagpt.cloud
==========================================

=== Checking Root Domain ===
Checking DNS for mydatagpt.cloud... OK - Resolves to 1.2.3.4
Checking HTTP server for mydatagpt.cloud... OK - Your VPS nginx is responding
Checking ACME challenge access for mydatagpt.cloud... OK - Directory accessible (HTTP 404)

=== Checking www.mydatagpt.cloud ===
Checking DNS for www.mydatagpt.cloud... OK - Resolves to 1.2.3.4
...

==========================================
Summary
==========================================
✓ All checks passed!

Your DNS appears to be correctly configured.
You can now proceed with SSL certificate installation:

  sudo certbot --nginx -d mydatagpt.cloud -d www.mydatagpt.cloud -d api.mydatagpt.cloud
```

**Troubleshooting:**

If checks fail, the script will provide specific actions to take. For detailed troubleshooting, see:
- [DNS Setup Guide](../docs/DNS_SETUP.md)
- [SSL Troubleshooting Guide](../docs/TROUBLESHOOTING_SSL.md)

## Requirements

The verification script requires:
- `dig` command (from `dnsutils` or `bind-utils` package)
- `curl` command
- Bash shell

**Install requirements:**

```bash
# Ubuntu/Debian
sudo apt-get update
sudo apt-get install -y dnsutils curl

# CentOS/RHEL
sudo yum install -y bind-utils curl

# macOS (usually pre-installed)
brew install bind
```

## Related Documentation

- [DNS Setup Guide](../docs/DNS_SETUP.md) - Complete DNS configuration instructions
- [Deployment Checklist](../docs/DEPLOYMENT_CHECKLIST.md) - Full deployment procedure
- [SSL Troubleshooting](../docs/TROUBLESHOOTING_SSL.md) - Detailed troubleshooting guide
- [Blueprint](../docs/blueprint.md) - Application architecture
