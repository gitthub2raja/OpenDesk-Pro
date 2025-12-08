/**
 * License Manager Service (Image-Based Activation)
 * Checks for license.json in /app/License/ at startup only
 * License is baked into the Docker image - no database updates needed
 * Features are determined by license presence in the image
 */

import fs from 'fs'

// Path to license file inside Docker container
const LICENSE_PATH = '/app/License/license.json'

/**
 * Check license from /app/License/license.json (image-based)
 * Returns license info without updating database
 * Features are determined by licenseService.js in-memory state
 */
export const checkLicenseInfo = () => {
  try {
    // Check if license.json exists
    if (!fs.existsSync(LICENSE_PATH)) {
      return { exists: false, isPro: false, data: null }
    }

    // Read and parse license.json
    const licenseContent = fs.readFileSync(LICENSE_PATH, 'utf8')
    const licenseData = JSON.parse(licenseContent)

    // Check if it's a Pro license
    const isPro = 
      licenseData.plan === 'PRO' ||
      licenseData.tier === 'PRO' ||
      licenseData.tier === 'PRO_LIFETIME'

    return {
      exists: true,
      isPro,
      data: licenseData
    }
  } catch (error) {
    console.error('[LicenseManager] Error reading license:', error.message)
    return { exists: false, isPro: false, data: null }
  }
}

export default {
  checkLicenseInfo
}


