# MyDataGPT

A secure, AI-powered personal data management application with end-to-end encryption.

## Quick Start

To get started with development, take a look at `src/app/page.tsx`.

## Documentation

- **[Blueprint](docs/blueprint.md)** - Architecture and feature overview
- **[DNS Setup](docs/DNS_SETUP.md)** - Complete guide for configuring DNS and SSL certificates
- **[Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md)** - Step-by-step deployment guide

## Deployment

For production deployment to mydatagpt.cloud:

1. **Configure DNS** - Follow the [DNS Setup Guide](docs/DNS_SETUP.md) to point your domain to your VPS
2. **Deploy Application** - Use the [Deployment Checklist](docs/DEPLOYMENT_CHECKLIST.md) for step-by-step instructions
3. **SSL Certificates** - After DNS propagation, run Certbot to obtain certificates

## Key Features

- Secure data upload with end-to-end encryption
- AI-powered data retrieval using Ollama/LLaMA
- Facial recognition authentication
- ChatGPT-like interface
- Automatic backup and restore functionality

See [blueprint.md](docs/blueprint.md) for complete architecture and feature details.
