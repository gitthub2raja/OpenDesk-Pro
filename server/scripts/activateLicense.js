/**
 * License Activation Script
 * Reads license.json from project root and activates Pro features for all organizations
 */

import fs from 'fs'
import path from 'path'
import { fileURLToPath } from 'url'
import { dirname } from 'path'
import Organization from '../models/Organization.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = dirname(__filename)

// Get project root (two levels up from server/scripts)
const projectRoot = path.resolve(__dirname, '../../')
const licensePath = path.join(projectRoot, 'license.json')

/**
 * Activate license for all organizations
 */
export const activateLicense = async () => {
  try {
    // Check if license.json exists
    if (!fs.existsSync(licensePath)) {
      console.log('[License] No license.json file found in project root')
      return false
    }

    // Read and parse license.json
    const licenseData = JSON.parse(fs.readFileSync(licensePath, 'utf8'))
    
    // Validate license structure
    if (!licenseData.product || !licenseData.tier) {
      console.log('[License] Invalid license.json format')
      return false
    }

    // Check if it's a Pro license
    if (licenseData.tier !== 'PRO_LIFETIME' && licenseData.tier !== 'PRO') {
      console.log('[License] License is not a Pro license')
      return false
    }

    console.log(`[License] Found valid Pro license: ${licenseData.id || 'N/A'}`)
    console.log(`[License] Product: ${licenseData.product}`)
    console.log(`[License] Tier: ${licenseData.tier}`)
    console.log(`[License] Validity: ${licenseData.validity || 'N/A'}`)

    // Update all organizations to PRO plan
    const result = await Organization.updateMany(
      {}, // Update all organizations
      {
        $set: {
          plan: 'PRO',
          paymentStatus: 'VERIFIED',
          // For lifetime licenses, set subscriptionExpiry to far future (100 years)
          subscriptionExpiry: licenseData.validity === 'Perpetual' || licenseData.tier === 'PRO_LIFETIME'
            ? new Date(Date.now() + 100 * 365 * 24 * 60 * 60 * 1000) // 100 years from now
            : null,
          paymentReference: `LICENSE-${licenseData.id || 'AUTO'}`,
        }
      }
    )

    console.log(`[License] ✅ Activated Pro features for ${result.modifiedCount} organization(s)`)
    console.log(`[License] ✅ Total organizations: ${result.matchedCount}`)
    
    return true
  } catch (error) {
    console.error('[License] Error activating license:', error.message)
    return false
  }
}

// If run directly, execute activation
if (process.argv[1] && import.meta.url === `file://${process.argv[1]}`) {
  import('../config/database.js').then(async (module) => {
    const connectDB = module.default
    await connectDB()
    await activateLicense()
    process.exit(0)
  }).catch((error) => {
    console.error('Error running license activation:', error)
    process.exit(1)
  })
}

export default activateLicense

