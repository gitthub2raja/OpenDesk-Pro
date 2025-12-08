/**
 * Frontend Obfuscation Build Script
 * Obfuscates JavaScript files in the Vite build output
 */

import JavaScriptObfuscator from 'javascript-obfuscator'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { readdir } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const frontendDir = path.resolve(__dirname, '..')
const distDir = path.join(frontendDir, 'dist')
const obfuscatorConfig = (await import('../obfuscator.config.js')).default

/**
 * Obfuscate a single file
 */
function obfuscateFile(filePath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8')
    
    // Skip if file is too small or doesn't contain meaningful JS
    if (code.length < 100) {
      return
    }

    const obfuscationResult = JavaScriptObfuscator.obfuscate(code, obfuscatorConfig)
    const obfuscatedCode = obfuscationResult.getObfuscatedCode()

    fs.writeFileSync(filePath, obfuscatedCode, 'utf8')
    console.log(`✓ Obfuscated: ${path.relative(distDir, filePath)}`)
  } catch (error) {
    console.error(`✗ Error obfuscating ${filePath}:`, error.message)
  }
}

/**
 * Recursively find all JS files
 */
async function findJsFiles(dir, fileList = []) {
  const entries = await readdir(dir, { withFileTypes: true })
  
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name)
    
    if (entry.isDirectory()) {
      await findJsFiles(fullPath, fileList)
    } else if (entry.isFile() && entry.name.endsWith('.js')) {
      fileList.push(fullPath)
    }
  }
  
  return fileList
}

/**
 * Main build function
 */
async function obfuscateBuild() {
  console.log('🔒 Starting frontend obfuscation...\n')

  if (!fs.existsSync(distDir)) {
    console.error('❌ Dist directory not found. Please run "npm run build" first.')
    process.exit(1)
  }

  // Find all JS files in dist directory
  const jsFiles = await findJsFiles(distDir)

  console.log(`Found ${jsFiles.length} JavaScript files to obfuscate\n`)

  // Obfuscate each file
  for (const file of jsFiles) {
    obfuscateFile(file)
  }

  console.log('\n✅ Frontend obfuscation complete!')
}

obfuscateBuild().catch(console.error)

