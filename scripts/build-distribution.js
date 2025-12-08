/**
 * Distribution Build Pipeline
 * Creates a Docker-only release package with only 4 encrypted files
 */

import fs from 'fs'
import path from 'path'
import { gzip } from 'zlib'
import { promisify } from 'util'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { execSync } from 'child_process'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)
const projectRoot = path.resolve(__dirname, '..')
const distRoot = path.join(projectRoot, 'dist-release')

const gzipAsync = promisify(gzip)

// Files to encrypt into the bundle
const FILES_TO_ENCRYPT = [
  'docker-compose.yml',
  'nginx-ssl.conf',
  'server/Dockerfile',
  'frontend/Dockerfile',
  'frontend/nginx-frontend.conf'
]

// Create distribution-specific Dockerfiles
function createDistDockerfile(type, originalContent) {
  if (type === 'server') {
    return `# Backend Dockerfile (Distribution)
FROM node:18-alpine

WORKDIR /app

# Copy all files from dist (already obfuscated)
COPY . .

EXPOSE 5000

# Health check
HEALTHCHECK --interval=30s --timeout=3s --start-period=5s --retries=3 \\
  CMD node -e "require('http').get('http://localhost:5000/api/health', (r) => {process.exit(r.statusCode === 200 ? 0 : 1)})"

CMD ["node", "server.js"]
`
  } else if (type === 'frontend') {
    return `# Frontend Dockerfile (Distribution)
FROM nginx:alpine

# Copy built files (already obfuscated)
COPY dist /usr/share/nginx/html

# Copy nginx configuration
COPY nginx-frontend.conf /etc/nginx/conf.d/default.conf

EXPOSE 80

CMD ["nginx", "-g", "daemon off;"]
`
  }
  return originalContent
}

// Update docker-compose.yml paths for distribution
function updateDockerCompose(content) {
  // Update build contexts to use dist folders
  let updated = content.replace(/context: \.\/server/g, 'context: ./server/dist')
  updated = updated.replace(/context: \.\/frontend/g, 'context: ./frontend/dist')
  // Update volume paths if needed
  updated = updated.replace(/- \.\/server\/uploads:/g, '- ./server/dist/uploads:')
  return updated
}

// Directories to include in distribution (obfuscated builds)
const DIRS_TO_INCLUDE = [
  'server/dist',
  'frontend/dist',
  'License'
]

async function encryptFile(inputPath, outputPath) {
  try {
    const content = fs.readFileSync(inputPath, 'utf8')
    const compressed = await gzipAsync(Buffer.from(content))
    const encoded = compressed.toString('base64')
    
    const encrypted = `# Encrypted file - Do not edit
${encoded}`
    
    fs.writeFileSync(outputPath, encrypted, 'utf8')
    console.log(`✓ Encrypted: ${path.relative(projectRoot, inputPath)}`)
  } catch (error) {
    console.error(`✗ Error encrypting ${inputPath}:`, error.message)
    throw error
  }
}

async function createEncryptedBundle() {
  console.log('📦 Creating encrypted bundle...')
  
  const bundle = {
    files: {},
    timestamp: new Date().toISOString()
  }
  
  for (const file of FILES_TO_ENCRYPT) {
    const filePath = path.join(projectRoot, file)
    let content = ''
    
    if (fs.existsSync(filePath)) {
      content = fs.readFileSync(filePath, 'utf8')
    } else {
      console.warn(`⚠️  File not found: ${file}, creating distribution version`)
    }
    
    // Create distribution-specific versions
    if (file === 'docker-compose.yml') {
      content = updateDockerCompose(content)
    } else if (file === 'server/Dockerfile') {
      content = createDistDockerfile('server', content)
    } else if (file === 'frontend/Dockerfile') {
      content = createDistDockerfile('frontend', content)
    }
    
    bundle.files[file] = content
  }
  
  const bundleJson = JSON.stringify(bundle, null, 2)
  const compressed = await gzipAsync(Buffer.from(bundleJson))
  const encoded = compressed.toString('base64')
  
  return `# Encrypted bundle - Do not edit
${encoded}`
}

async function buildDistribution() {
  console.log('🚀 Starting Distribution Build Pipeline...\n')
  
  // Clean dist-release directory
  if (fs.existsSync(distRoot)) {
    fs.rmSync(distRoot, { recursive: true, force: true })
  }
  fs.mkdirSync(distRoot, { recursive: true })
  
  // Step 1: Install dependencies and build obfuscated code
  console.log('📥 Step 1: Installing dependencies...')
  try {
    // Install server dependencies
    process.chdir(path.join(projectRoot, 'server'))
    execSync('npm install', { stdio: 'inherit' })
    if (!fs.existsSync(path.join(projectRoot, 'server/node_modules/javascript-obfuscator'))) {
      console.log('Installing javascript-obfuscator for server...')
      execSync('npm install --save-dev javascript-obfuscator', { stdio: 'inherit' })
    }
    
    // Install frontend dependencies
    process.chdir(path.join(projectRoot, 'frontend'))
    execSync('npm install', { stdio: 'inherit' })
    if (!fs.existsSync(path.join(projectRoot, 'frontend/node_modules/javascript-obfuscator'))) {
      console.log('Installing javascript-obfuscator for frontend...')
      execSync('npm install --save-dev javascript-obfuscator', { stdio: 'inherit' })
    }
    
    process.chdir(projectRoot)
  } catch (error) {
    console.error('❌ Dependency installation failed:', error.message)
    process.exit(1)
  }
  
  console.log('\n🔒 Step 1b: Building obfuscated code...')
  try {
    process.chdir(path.join(projectRoot, 'server'))
    execSync('npm run build', { stdio: 'inherit' })
    process.chdir(path.join(projectRoot, 'frontend'))
    execSync('npm run build:obfuscate', { stdio: 'inherit' })
    process.chdir(projectRoot)
  } catch (error) {
    console.error('❌ Build failed:', error.message)
    process.exit(1)
  }
  
  // Step 2: Copy obfuscated dist folders
  console.log('\n📋 Step 2: Copying obfuscated builds...')
  for (const dir of DIRS_TO_INCLUDE) {
    const srcPath = path.join(projectRoot, dir)
    const destPath = path.join(distRoot, dir)
    
    if (fs.existsSync(srcPath)) {
      fs.cpSync(srcPath, destPath, { recursive: true })
      console.log(`✓ Copied: ${dir}`)
    }
  }
  
  // Step 3: Create encrypted bundle
  console.log('\n🔐 Step 3: Creating encrypted bundle...')
  const encryptedBundle = await createEncryptedBundle()
  const bundlePath = path.join(distRoot, 'MASTER.sh.enc')
  fs.writeFileSync(bundlePath, encryptedBundle, 'utf8')
  console.log('✓ Encrypted bundle created')
  
  // Step 4: Create MASTER.sh (Docker-only launcher)
  console.log('\n📝 Step 4: Creating MASTER.sh launcher...')
  execSync(`node ${path.join(__dirname, 'create-master-sh.js')} ${path.join(distRoot, 'MASTER.sh')}`, { stdio: 'inherit' })
  console.log('✓ MASTER.sh created')
  
  // Step 5: Create encrypted documentation
  console.log('\n📚 Step 5: Creating encrypted documentation...')
  const masterMdContent = `# OpenDesk Pro - Docker Installation

## Quick Start

1. Ensure Docker and Docker Compose are installed
2. Run: \`./MASTER.sh\`
3. Access at: http://localhost

## License Activation

Place your \`license.json\` file in the \`License/\` folder before starting.

## Commands

- Start: \`./MASTER.sh\`
- Stop: \`docker compose down\`
- Logs: \`docker compose logs -f\`
- Restart: \`docker compose restart\`

## Requirements

- Docker 20.10+
- Docker Compose 2.0+
- 4GB RAM minimum
- 10GB disk space
`
  
  const mdCompressed = await gzipAsync(Buffer.from(masterMdContent))
  const mdEncoded = mdCompressed.toString('base64')
  const mdEncrypted = `# Encrypted documentation - Do not edit
${mdEncoded}`
  
  fs.writeFileSync(path.join(distRoot, 'MASTER.md.enc'), mdEncrypted, 'utf8')
  console.log('✓ Documentation encrypted')
  
  // Step 6: Create placeholder MASTER.md
  const placeholderMd = `# OpenDesk Pro

This documentation is encrypted. The application uses Docker Compose for deployment.

Run \`./MASTER.sh\` to start the application.

For documentation, decrypt MASTER.md.enc using:
\`\`\`bash
node -e "const fs=require('fs');const zlib=require('zlib');const c=fs.readFileSync('MASTER.md.enc','utf8');const l=c.split('\\n').filter(x=>!x.trim().startsWith('#'));const e=l.join('\\n').trim();const b=Buffer.from(e,'base64');const d=zlib.gunzipSync(b);console.log(d.toString('utf8'));"
\`\`\`
`
  
  fs.writeFileSync(path.join(distRoot, 'MASTER.md'), placeholderMd, 'utf8')
  console.log('✓ MASTER.md placeholder created')
  
  // Step 7: Remove all unnecessary files and source directories
  console.log('\n🗑️  Step 7: Removing source files and directories...')
  
  // Remove all .sh files except MASTER.sh
  const shFiles = fs.readdirSync(distRoot).filter(f => f.endsWith('.sh') && f !== 'MASTER.sh')
  for (const file of shFiles) {
    fs.unlinkSync(path.join(distRoot, file))
    console.log(`✓ Removed: ${file}`)
  }
  
  // Remove all .md files except MASTER.md
  const mdFiles = fs.readdirSync(distRoot).filter(f => f.endsWith('.md') && f !== 'MASTER.md')
  for (const file of mdFiles) {
    fs.unlinkSync(path.join(distRoot, file))
    console.log(`✓ Removed: ${file}`)
  }
  
  // Remove source directories
  const dirsToRemove = [
    'scripts',
    'installation_files',
    'backend',
    'server/models',
    'server/routes',
    'server/middleware',
    'server/services',
    'server/workers',
    'server/config',
    'server/scripts',
    'frontend/src',
    'frontend/scripts'
  ]
  
  for (const dir of dirsToRemove) {
    const dirPath = path.join(distRoot, dir)
    if (fs.existsSync(dirPath)) {
      fs.rmSync(dirPath, { recursive: true, force: true })
      console.log(`✓ Removed: ${dir}/`)
    }
  }
  
  // Remove source files from server
  const serverFilesToRemove = [
    'server/obfuscator.config.js',
    'server/package.json',
    'server/package-lock.json',
    'server/server.js'
  ]
  
  for (const file of serverFilesToRemove) {
    const filePath = path.join(distRoot, file)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`✓ Removed: ${file}`)
    }
  }
  
  // Remove source files from frontend
  const frontendFilesToRemove = [
    'frontend/obfuscator.config.js',
    'frontend/package.json',
    'frontend/package-lock.json',
    'frontend/vite.config.js',
    'frontend/tailwind.config.js',
    'frontend/postcss.config.js',
    'frontend/index.html',
    'frontend/public'
  ]
  
  for (const file of frontendFilesToRemove) {
    const filePath = path.join(distRoot, file)
    if (fs.existsSync(filePath)) {
      fs.rmSync(filePath, { recursive: true, force: true })
      console.log(`✓ Removed: ${file}`)
    }
  }
  
  // Remove root level files
  const rootFilesToRemove = [
    'nginx-ssl.conf',
    'docker-compose.yml',
    'license.json',
    'package.json',
    'package-lock.json'
  ]
  
  for (const file of rootFilesToRemove) {
    const filePath = path.join(distRoot, file)
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath)
      console.log(`✓ Removed: ${file}`)
    }
  }
  
  // Remove License/README.md (keep folder structure)
  const licenseReadme = path.join(distRoot, 'License/README.md')
  if (fs.existsSync(licenseReadme)) {
    fs.unlinkSync(licenseReadme)
    console.log('✓ Removed: License/README.md')
  }
  
  // Verify final structure
  console.log('\n🔍 Step 8: Verifying distribution structure...')
  const finalFiles = fs.readdirSync(distRoot, { withFileTypes: true })
  const fileCount = finalFiles.filter(f => f.isFile()).length
  const dirCount = finalFiles.filter(f => f.isDirectory()).length
  
  console.log(`✓ Files: ${fileCount}, Directories: ${dirCount}`)
  
  // Final summary
  console.log('\n✅ Distribution build complete!')
  console.log(`📦 Output directory: ${distRoot}`)
  console.log('\n📋 Distribution contains ONLY:')
  console.log('  ✅ MASTER.sh (Docker launcher)')
  console.log('  ✅ MASTER.sh.enc (Encrypted bundle with docker-compose.yml)')
  console.log('  ✅ MASTER.md (Placeholder)')
  console.log('  ✅ MASTER.md.enc (Encrypted docs)')
  console.log('  ✅ server/dist/ (Obfuscated backend)')
  console.log('  ✅ frontend/dist/ (Obfuscated frontend)')
  console.log('  ✅ License/ (Empty folder for user license.json)')
  console.log('\n🚀 Ready for GitHub deployment!')
  console.log('\n⚠️  IMPORTANT: Users can ONLY run ./MASTER.sh to start the application')
  console.log('   All source code, scripts, and configs are encrypted/removed')
}

buildDistribution().catch(console.error)

