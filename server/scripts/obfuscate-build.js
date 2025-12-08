/**
 * Backend Obfuscation Build Script
 * Obfuscates all JavaScript files in the server directory
 */

import JavaScriptObfuscator from 'javascript-obfuscator'
import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import { readdir } from 'fs/promises'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

const serverDir = path.resolve(__dirname, '..')
const distDir = path.join(serverDir, 'dist')
const obfuscatorConfig = (await import('../obfuscator.config.js')).default

// Files/folders to exclude from obfuscation
const excludePatterns = [
  'node_modules/**',
  'dist/**',
  'uploads/**',
  'scripts/obfuscate-build.js',
  'obfuscator.config.js',
  'package.json',
  'package-lock.json'
]

// Files to copy as-is (non-JS files)
const copyExtensions = ['.json', '.env', '.md', '.txt']

/**
 * Recursively get all JS files
 */
async function getAllJsFiles(dir, fileList = []) {
  const files = await readdir(dir, { withFileTypes: true })
  
  for (const file of files) {
    const filePath = path.join(dir, file.name)
    const relativePath = path.relative(serverDir, filePath)
    
    // Skip excluded patterns
    const shouldExclude = excludePatterns.some(pattern => {
      const regex = new RegExp(pattern.replace(/\*\*/g, '.*').replace(/\*/g, '[^/]*'))
      return regex.test(relativePath)
    })
    
    if (shouldExclude) continue
    
    if (file.isDirectory()) {
      await getAllJsFiles(filePath, fileList)
    } else if (file.isFile() && file.name.endsWith('.js')) {
      fileList.push(filePath)
    }
  }
  
  return fileList
}

/**
 * Copy file maintaining directory structure
 */
function copyFile(src, dest) {
  const destDir = path.dirname(dest)
  if (!fs.existsSync(destDir)) {
    fs.mkdirSync(destDir, { recursive: true })
  }
  fs.copyFileSync(src, dest)
}

/**
 * Recursively copy non-JS files
 */
async function copyNonJsFiles(srcDir, destDir, currentDir = srcDir) {
  const entries = await readdir(currentDir, { withFileTypes: true })
  
  for (const entry of entries) {
    const srcPath = path.join(currentDir, entry.name)
    const relativePath = path.relative(srcDir, srcPath)
    const destPath = path.join(destDir, relativePath)
    
    // Skip excluded directories
    if (entry.isDirectory()) {
      if (entry.name === 'node_modules' || entry.name === 'dist' || entry.name === 'uploads') {
        continue
      }
      if (!fs.existsSync(destPath)) {
        fs.mkdirSync(destPath, { recursive: true })
      }
      await copyNonJsFiles(srcDir, destDir, srcPath)
    } else if (entry.isFile()) {
      const ext = path.extname(entry.name)
      if (copyExtensions.includes(ext) || (!ext && !entry.name.endsWith('.js'))) {
        copyFile(srcPath, destPath)
      }
    }
  }
}

/**
 * Obfuscate a single file
 */
function obfuscateFile(filePath, outputPath) {
  try {
    const code = fs.readFileSync(filePath, 'utf8')
    const obfuscationResult = JavaScriptObfuscator.obfuscate(code, obfuscatorConfig)
    const obfuscatedCode = obfuscationResult.getObfuscatedCode()

    // Ensure output directory exists
    const outputDir = path.dirname(outputPath)
    if (!fs.existsSync(outputDir)) {
      fs.mkdirSync(outputDir, { recursive: true })
    }

    fs.writeFileSync(outputPath, obfuscatedCode, 'utf8')
    console.log(`✓ Obfuscated: ${path.relative(serverDir, filePath)}`)
  } catch (error) {
    console.error(`✗ Error obfuscating ${filePath}:`, error.message)
    // Copy original file if obfuscation fails
    copyFile(filePath, outputPath)
  }
}

/**
 * Main build function
 */
async function build() {
  console.log('🔒 Starting backend obfuscation build...\n')

  // Clean dist directory
  if (fs.existsSync(distDir)) {
    fs.rmSync(distDir, { recursive: true, force: true })
  }
  fs.mkdirSync(distDir, { recursive: true })

  // Get all JS files
  const jsFiles = await getAllJsFiles(serverDir)
  console.log(`Found ${jsFiles.length} JavaScript files to obfuscate\n`)

  // Obfuscate each file
  for (const file of jsFiles) {
    const relativePath = path.relative(serverDir, file)
    const outputPath = path.join(distDir, relativePath)
    obfuscateFile(file, outputPath)
  }

  // Copy non-JS files
  console.log('\n📋 Copying non-JS files...')
  await copyNonJsFiles(serverDir, distDir)

  // Copy uploads directory if it exists
  const uploadsDir = path.join(serverDir, 'uploads')
  if (fs.existsSync(uploadsDir)) {
    const destUploads = path.join(distDir, 'uploads')
    fs.cpSync(uploadsDir, destUploads, { recursive: true })
    console.log('✓ Copied uploads directory')
  }

  console.log('\n✅ Backend obfuscation build complete!')
  console.log(`📦 Output: ${distDir}`)
}

build().catch(console.error)

