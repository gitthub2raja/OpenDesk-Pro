# SSL Certificates Directory

This directory contains SSL certificates for HTTPS support.

## Generating Certificates

Run the SSL generation script:
```bash
./scripts/generate-ssl.sh
```

This will create:
- `cert.pem` - SSL certificate
- `key.pem` - Private key

## For Production

Replace these files with your production certificates:
- Certificate from Let's Encrypt or your CA
- Private key

## Security

⚠️ **Never commit certificates to version control!**

This directory is already in `.gitignore`.

