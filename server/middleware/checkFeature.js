/**
 * Feature Gating Middleware
 * Checks if the user's organization has access to a specific feature
 * Features requiring PRO plan:
 * - SLA_MANAGER
 * - SSO_INTEGRATION
 * - EXTERNAL_INTEGRATIONS
 * - ADVANCED_REPORTS
 * - EMAIL_AUTOMATION
 * - TEAMS_INTEGRATION
 * - AZURE_SENTINEL
 * - DOMAIN_RULES
 * - CUSTOM_ROLES
 */

import Organization from '../models/Organization.js'
import { isProEnabled } from '../services/licenseService.js'
import { checkLockFile } from '../services/lockFileService.js'

// Feature to plan mapping
const FEATURE_PLAN_REQUIREMENTS = {
  SLA_MANAGER: 'PRO',
  SSO_INTEGRATION: 'PRO',
  EXTERNAL_INTEGRATIONS: 'PRO',
  ADVANCED_REPORTS: 'PRO',
  EMAIL_AUTOMATION: 'PRO',
  TEAMS_INTEGRATION: 'PRO',
  AZURE_SENTINEL: 'PRO',
  DOMAIN_RULES: 'PRO',
  CUSTOM_ROLES: 'PRO',
}

/**
 * Middleware factory to check feature access
 * @param {string} featureName - Name of the feature to check
 * @returns {Function} Express middleware function
 */
export const checkFeature = (featureName) => {
  return async (req, res, next) => {
    try {
      // Get user's organization
      if (!req.user || !req.user.organization) {
        return res.status(403).json({ 
          message: 'This feature requires a Pro upgrade.',
          requiresUpgrade: true 
        })
      }

      // Populate organization if not already populated
      let organization
      if (typeof req.user.organization === 'object' && req.user.organization._id) {
        organization = req.user.organization
      } else {
        organization = await Organization.findById(req.user.organization)
      }

      if (!organization) {
        return res.status(403).json({ 
          message: 'This feature requires a Pro upgrade.',
          requiresUpgrade: true 
        })
      }

      // Check if feature requires PRO plan
      const requiredPlan = FEATURE_PLAN_REQUIREMENTS[featureName]
      
      if (requiredPlan === 'PRO') {
        // Priority 1: Check lock file (destructive activation - highest priority)
        const lockFileActive = checkLockFile()
        if (lockFileActive) {
          return next()
        }
        
        // Priority 2: Check file-based license (image-based activation)
        const fileLicenseActive = isProEnabled()
        if (fileLicenseActive) {
          return next()
        }
        
        // Priority 3: Check database plan (fallback)
        if (organization.plan !== 'PRO') {
          // Check if subscription is expired
          if (organization.subscriptionExpiry && new Date() > organization.subscriptionExpiry) {
            return res.status(403).json({ 
              message: 'Your Pro subscription has expired. Please renew to access this feature.',
              requiresUpgrade: true,
              subscriptionExpired: true
            })
          }

          return res.status(403).json({ 
            message: 'This feature requires a Pro upgrade. If you previously activated, the lock file may be missing. You must purchase again.',
            requiresUpgrade: true,
            feature: featureName
          })
        }
      }

      // Feature is accessible
      next()
    } catch (error) {
      console.error('Feature check error:', error)
      res.status(500).json({ message: 'Error checking feature access' })
    }
  }
}

/**
 * Helper function to check if organization has access to a feature
 * @param {Object} organization - Organization object
 * @param {string} featureName - Name of the feature
 * @returns {boolean} - True if organization has access
 */
export const hasFeatureAccess = (organization, featureName) => {
  if (!organization) return false

  const requiredPlan = FEATURE_PLAN_REQUIREMENTS[featureName]
  
  if (requiredPlan === 'PRO') {
    // Priority 1: Check lock file (destructive activation - highest priority)
    if (checkLockFile()) {
      return true
    }
    
    // Priority 2: Check file-based license (image-based activation)
    if (isProEnabled()) {
      return true
    }
    
    // Priority 3: Check database plan (fallback)
    if (organization.plan !== 'PRO') return false
    
    // Check if subscription is expired
    if (organization.subscriptionExpiry && new Date() > organization.subscriptionExpiry) {
      return false
    }
  }

  return true
}

export default checkFeature

