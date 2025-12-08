#!/bin/bash
###############################################################################
# OpenDesk Pro - Docker-Only Launcher
# This script requires Docker and Docker Compose
###############################################################################

set -e

RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m'

SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
BUNDLE_FILE="$SCRIPT_DIR/MASTER.sh.enc"
COMPOSE_FILE="$SCRIPT_DIR/.docker-compose.yml"
NGINX_FILE="$SCRIPT_DIR/.nginx-ssl.conf"

# Trap to ensure cleanup on exit
cleanup() {
    rm -f "$COMPOSE_FILE" "$NGINX_FILE"
}
trap cleanup EXIT INT TERM

# Check Docker
if ! command -v docker &> /dev/null; then
    echo -e "${RED}❌ Error: Docker is not installed.${NC}"
    echo "Please install Docker from https://docs.docker.com/get-docker/"
    exit 1
fi

# Check Docker Compose
COMPOSE_CMD=""
if command -v docker-compose &> /dev/null; then
    COMPOSE_CMD="docker-compose"
elif docker compose version &> /dev/null 2>&1; then
    COMPOSE_CMD="docker compose"
else
    echo -e "${RED}❌ Error: Docker Compose is not installed.${NC}"
    echo "Please install Docker Compose from https://docs.docker.com/compose/install/"
    exit 1
fi

# Decrypt configuration files
echo -e "${BLUE}[INFO]${NC} Decrypting configuration..."
if ! command -v node &> /dev/null; then
    echo -e "${RED}❌ Error: Node.js is required to decrypt configuration${NC}"
    echo "Please install Node.js from https://nodejs.org/"
    exit 1
fi

node -e "
const fs = require(\'fs\');
const zlib = require(\'zlib\');
const path = require(\'path\');

try {
    const content = fs.readFileSync(process.argv[1], \'utf8\');
    const lines = content.split(\'\\n\').filter(l => !l.trim().startsWith(\'#\'));
    const encoded = lines.join(\'\\n\').trim();
    const compressed = Buffer.from(encoded, \'base64\');
    const decompressed = zlib.gunzipSync(compressed);
    const bundle = JSON.parse(decompressed.toString(\'utf8\'));
    
    // Write docker-compose.yml
    if (bundle.files[\'docker-compose.yml\']) {
        fs.writeFileSync(process.argv[2], bundle.files[\'docker-compose.yml\']);
    }
    
    // Write nginx config
    if (bundle.files[\'nginx-ssl.conf\']) {
        fs.writeFileSync(process.argv[3], bundle.files[\'nginx-ssl.conf\']);
    }
    
    process.exit(0);
} catch (error) {
    console.error(\'Decryption error:\', error.message);
    process.exit(1);
}
" "$BUNDLE_FILE" "$COMPOSE_FILE" "$NGINX_FILE" || {
    echo -e "${RED}❌ Error: Failed to decrypt configuration${NC}"
    exit 1
}

# Verify files were created
if [ ! -f "$COMPOSE_FILE" ]; then
    echo -e "${RED}❌ Error: Failed to create docker-compose.yml${NC}"
    exit 1
fi

# Run docker compose
echo -e "${GREEN}[INFO]${NC} Starting Docker containers..."
cd "$SCRIPT_DIR"
$COMPOSE_CMD -f "$COMPOSE_FILE" up -d

# Clean up immediately (trap will also handle this)
cleanup

echo -e "${GREEN}✅ OpenDesk Pro is starting...${NC}"
echo -e "${YELLOW}Access the application at: http://localhost${NC}"
echo -e "${YELLOW}View logs: $COMPOSE_CMD -f .docker-compose.yml logs -f${NC}"
echo -e "${YELLOW}Stop: $COMPOSE_CMD -f .docker-compose.yml down${NC}"
