# OpenDesk Pro - Master Documentation

This documentation is encrypted. To view it, run:

```bash
node scripts/decrypt-files.js
```

Or view directly:

```bash
node -e "
const fs = require('fs');
const zlib = require('zlib');
const content = fs.readFileSync('MASTER.md.enc', 'utf8');
const lines = content.split('\n').filter(l => !l.trim().startsWith('#'));
const encoded = lines.join('\n').trim();
const compressed = Buffer.from(encoded, 'base64');
const decompressed = zlib.gunzipSync(compressed);
console.log(decompressed.toString('utf8'));
"
```

The MASTER.sh script automatically decrypts and runs when executed.
