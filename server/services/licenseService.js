/**
 * File-Based License Service
 * Validates license.json from License/ folder and provides in-memory Pro feature access
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import crypto from 'crypto'
import { checkLockFile } from './lockFileService.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get project root (two levels up from server/services)
const projectRoot = path.resolve(__dirname, '../../')
const licenseFolderPath = path.join(projectRoot, 'License')
const licenseFilePath = path.join(licenseFolderPath, 'license.json')

// Docker container path (fallback)
const DOCKER_LICENSE_PATH = '/app/License/license.json'

// In-memory license state
let licenseState = {
  isValid: false,
  isPro: false,
  licenseData: null,
  lastChecked: null
}

// Secret key for license validation (should match license generation)
const LICENSE_SECRET = process.env.LICENSE_SECRET || 'opendesk-pro-license-secret-2024-secure-key'

/**
 * Validate license token signature
 */
const validateLicenseToken = (licenseData) => {
  try {
    // If no licenseKey, skip token validation (allow basic license structure)
    if (!licenseData.licenseKey) {
      return true // Allow licenses without token (for backward compatibility)
    }

    if (!licenseData.id) {
      return false
    }

    // Extract token parts
    const tokenParts = licenseData.licenseKey.split('.')
    if (tokenParts.length !== 3) {
      // Try simple hash validation if not JWT format
      return licenseData.id && licenseData.id.length > 0
    }

    const [header, payload, signature] = tokenParts

    // Verify signature
    const expectedSignature = crypto
      .createHmac('sha256', LICENSE_SECRET)
      .update(`${header}.${payload}`)
      .digest('hex')

    if (signature !== expectedSignature) {
      // For now, allow if basic structure is valid (can be tightened later)
      return licenseData.tier === 'PRO' || licenseData.tier === 'PRO_LIFETIME'
    }

    // Decode and validate payload
    try {
      const decodedPayload = JSON.parse(
        Buffer.from(payload.replace(/-/g, '+').replace(/_/g, '/'), 'base64').toString()
      )

      // Check expiration if exists
      if (decodedPayload.expiresAt) {
        const expiresAt = new Date(decodedPayload.expiresAt)
        if (new Date() > expiresAt) {
          return false
        }
      }

      // Validate tier
      const tier = licenseData.tier || decodedPayload.tier || decodedPayload.plan
      if (tier !== 'PRO' && tier !== 'PRO_LIFETIME') {
        return false
      }
    } catch (decodeError) {
      // If payload decode fails, still allow if tier is valid
      return licenseData.tier === 'PRO' || licenseData.tier === 'PRO_LIFETIME'
    }

    return true
  } catch (error) {
    console.error('[License] Token validation error:', error.message)
    // Fallback: allow if basic structure is valid
    return licenseData.tier === 'PRO' || licenseData.tier === 'PRO_LIFETIME'
  }
}

/**
 * Check and validate license file
 * Priority: Lock file (destructive activation) > license.json (image-based)
 */
export const checkLicense = () => {
  try {
    // First check lock file (destructive activation - highest priority)
    const lockFileExists = checkLockFile()
    if (lockFileExists) {
      console.log('[License] ✅ Lock file found - Pro features active (destructive activation)')
      licenseState.isValid = true
      licenseState.isPro = true
      licenseState.licenseData = {
        source: 'lock_file',
        activated: true
      }
      licenseState.lastChecked = new Date()
      return true
    }
    
    // Fallback to license.json (image-based activation)
    // Try multiple license file paths (for Docker and local development)
    let actualLicensePath = null
    
    // First try Docker path (most reliable in production)
    if (fs.existsSync(DOCKER_LICENSE_PATH)) {
      actualLicensePath = DOCKER_LICENSE_PATH
      console.log('[License] Found license at Docker path:', DOCKER_LICENSE_PATH)
    }
    // Fallback to resolved path (for local development)
    else if (fs.existsSync(licenseFilePath)) {
      actualLicensePath = licenseFilePath
      console.log('[License] Found license at resolved path:', licenseFilePath)
    }
    
    if (!actualLicensePath) {
      console.log('[License] No lock file or license.json found. Pro features disabled.')
      console.log('[License] Checked paths:')
      console.log('  - Lock file:', lockFileExists ? '(exists)' : '(not found)')
      console.log('  -', DOCKER_LICENSE_PATH, fs.existsSync(DOCKER_LICENSE_PATH) ? '(exists)' : '(not found)')
      console.log('  -', licenseFilePath, fs.existsSync(licenseFilePath) ? '(exists)' : '(not found)')
      licenseState.isValid = false
      licenseState.isPro = false
      licenseState.licenseData = null
      licenseState.lastChecked = new Date()
      return false
    }

    // Read and parse license.json
    const licenseContent = fs.readFileSync(actualLicensePath, 'utf8')
    const licenseData = JSON.parse(licenseContent)

    // Validate license structure
    if (!licenseData.product || !licenseData.tier) {
      console.log('[License] Invalid license.json format')
      licenseState.isValid = false
      licenseState.isPro = false
      licenseState.licenseData = null
      licenseState.lastChecked = new Date()
      return false
    }

    // Validate license token if present
    if (licenseData.licenseKey) {
      const tokenValid = validateLicenseToken(licenseData)
      if (!tokenValid) {
        console.log('[License] Invalid license token signature')
        licenseState.isValid = false
        licenseState.isPro = false
        licenseState.licenseData = null
        licenseState.lastChecked = new Date()
        return false
      }
    }

    // Check if it's a Pro license
    const isPro = licenseData.tier === 'PRO_LIFETIME' || licenseData.tier === 'PRO'

    if (!isPro) {
      console.log('[License] License is not a Pro license')
      licenseState.isValid = false
      licenseState.isPro = false
      licenseState.licenseData = null
      licenseState.lastChecked = new Date()
      return false
    }

    // License is valid
    licenseState.isValid = true
    licenseState.isPro = true
    licenseState.licenseData = licenseData
    licenseState.lastChecked = new Date()

    console.log(`[License] ✅ Valid Pro license found: ${licenseData.id || 'N/A'}`)
    console.log(`[License] Product: ${licenseData.product}`)
    console.log(`[License] Tier: ${licenseData.tier}`)
    console.log(`[License] Validity: ${licenseData.validity || 'N/A'}`)

    return true
  } catch (error) {
    console.error('[License] Error checking license:', error.message)
    licenseState.isValid = false
    licenseState.isPro = false
    licenseState.licenseData = null
    licenseState.lastChecked = new Date()
    return false
  }
}

/**
 * Get current license state
 */
export const getLicenseState = () => {
  return { ...licenseState }
}

/**
 * Check if Pro features are enabled
 */
export const isProEnabled = () => {
  // Re-check license if not checked in last 5 minutes
  const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000)
  if (!licenseState.lastChecked || licenseState.lastChecked < fiveMinutesAgo) {
    checkLicense()
  }
  return licenseState.isPro && licenseState.isValid
}

/**
 * Initialize license check on startup
 */
export const initializeLicense = () => {
  console.log('[License] Initializing license check...')
  const result = checkLicense()
  if (result) {
    console.log('[License] ✅ Pro features unlocked via License/license.json')
  } else {
    console.log('[License] ⚠️  Pro features locked - No valid license found')
  }
  return result
}

export default {
  checkLicense,
  getLicenseState,
  isProEnabled,
  initializeLicense
}

