# Distribution Build Pipeline Instructions

## Overview

The distribution build pipeline creates a Docker-only release package containing only 4 encrypted files that users can download from GitHub.

## Running the Build

```bash
node scripts/build-distribution.js
```

## What the Build Does

1. **Installs Dependencies**: Installs npm packages and javascript-obfuscator
2. **Builds Obfuscated Code**: 
   - Obfuscates backend code → `server/dist/`
   - Obfuscates frontend code → `frontend/dist/`
3. **Creates Encrypted Bundle**: Encrypts docker-compose.yml, nginx configs, and Dockerfiles into `MASTER.sh.enc`
4. **Creates MASTER.sh**: Docker-only launcher that:
   - Verifies Docker is installed
   - Decrypts docker-compose.yml on the fly
   - Runs `docker compose up -d`
   - Immediately deletes decrypted files
5. **Removes Source Files**: Deletes all .sh, .md, and source directories
6. **Output**: Creates `dist-release/` folder ready for GitHub

## Distribution Structure

The `dist-release/` folder contains ONLY:

```
dist-release/
├── MASTER.sh              # Docker launcher (auto-decrypts configs)
├── MASTER.sh.enc          # Encrypted bundle (docker-compose.yml, etc.)
├── MASTER.md              # Placeholder documentation
├── MASTER.md.enc          # Encrypted full documentation
├── server/dist/           # Obfuscated backend code
├── frontend/dist/         # Obfuscated frontend code
└── License/               # Empty folder (users add license.json)
```

## User Experience

1. User clones repository from GitHub
2. Sees only 4 files in root: `MASTER.sh`, `MASTER.sh.enc`, `MASTER.md`, `MASTER.md.enc`
3. Runs `./MASTER.sh`
4. Script verifies Docker, decrypts configs, starts containers
5. Application runs via Docker Compose

## Security Features

- ✅ All source code obfuscated
- ✅ All configs encrypted in MASTER.sh.enc
- ✅ Decrypted files deleted immediately after use
- ✅ No way to access source code or configs
- ✅ Docker-only installation (no manual setup possible)

## Deployment to GitHub

1. Build distribution: `node scripts/build-distribution.js`
2. Copy `dist-release/` contents to a new branch
3. Push to GitHub
4. Users clone and run `./MASTER.sh`

