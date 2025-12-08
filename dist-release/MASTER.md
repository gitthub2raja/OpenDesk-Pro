# OpenDesk Pro

This documentation is encrypted. The application uses Docker Compose for deployment.

Run `./MASTER.sh` to start the application.

For documentation, decrypt MASTER.md.enc using:
```bash
node -e "const fs=require('fs');const zlib=require('zlib');const c=fs.readFileSync('MASTER.md.enc','utf8');const l=c.split('\n').filter(x=>!x.trim().startsWith('#'));const e=l.join('\n').trim();const b=Buffer.from(e,'base64');const d=zlib.gunzipSync(b);console.log(d.toString('utf8'));"
```
