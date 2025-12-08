#!/bin/bash
###############################################################################
# OpenDesk Pro - Master Script (Auto-Decrypting Launcher)
# This script automatically decrypts and runs the master script
###############################################################################

set -e

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
ENCRYPTED_FILE="$SCRIPT_DIR/MASTER.sh.enc"
DECRYPTED_FILE="$SCRIPT_DIR/.MASTER.sh.decrypted"

# Check if encrypted file exists
if [ ! -f "$ENCRYPTED_FILE" ]; then
    echo "Error: Encrypted file not found: $ENCRYPTED_FILE"
    exit 1
fi

# Decrypt if needed or if decrypted file is older
if [ ! -f "$DECRYPTED_FILE" ] || [ "$ENCRYPTED_FILE" -nt "$DECRYPTED_FILE" ]; then
    # Use Node.js to decrypt
    if command -v node &> /dev/null; then
        node -e "
        const fs = require('fs');
        const zlib = require('zlib');
        const content = fs.readFileSync('$ENCRYPTED_FILE', 'utf8');
        const lines = content.split('\n').filter(l => !l.trim().startsWith('#'));
        const encoded = lines.join('\n').trim();
        const compressed = Buffer.from(encoded, 'base64');
        const decompressed = zlib.gunzipSync(compressed);
        fs.writeFileSync('$DECRYPTED_FILE', decompressed.toString('utf8'));
        fs.chmodSync('$DECRYPTED_FILE', 0o755);
        " 2>/dev/null || {
            echo "Error: Failed to decrypt. Trying with decrypt-files.js..."
            node "$SCRIPT_DIR/scripts/decrypt-files.js" 2>/dev/null || {
                echo "Error: Decryption failed. Please ensure Node.js is installed."
                exit 1
            }
        }
    else
        echo "Error: Node.js is required to decrypt the script"
        exit 1
    fi
fi

# Execute decrypted script with all arguments
exec "$DECRYPTED_FILE" "$@"
