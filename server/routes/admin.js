import express from 'express'
import SSOConfig from '../models/SSOConfig.js'
import EmailSettings from '../models/EmailSettings.js'
import Logo from '../models/Logo.js'
import Role from '../models/Role.js'
import SLAPolicy from '../models/SLAPolicy.js'
import Organization from '../models/Organization.js'
import { protect, admin } from '../middleware/auth.js'
import { checkFeature } from '../middleware/checkFeature.js'
import { getLicenseState, checkLicense } from '../services/licenseService.js'
import { createLockFile, checkLockFile } from '../services/lockFileService.js'

const router = express.Router()

const normalizeDomainList = (value) => {
  if (!value) return []
  const items = Array.isArray(value) ? value : String(value).split(/[,\\n]/)
  const trimmed = items
    .map(d => d && String(d).trim().replace(/^@/, '').toLowerCase())
    .filter(Boolean)
  return Array.from(new Set(trimmed))
}

// SSO Configuration Routes (PRO feature)
router.get('/sso', protect, admin, checkFeature('SSO_INTEGRATION'), async (req, res) => {
  try {
    const configs = await SSOConfig.find()
    res.json(configs)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/sso', protect, admin, checkFeature('SSO_INTEGRATION'), async (req, res) => {
  try {
    const { provider, enabled, config } = req.body
    let ssoConfig = await SSOConfig.findOne({ provider })

    if (ssoConfig) {
      ssoConfig.enabled = enabled
      ssoConfig.config = { ...ssoConfig.config, ...config }
      await ssoConfig.save()
    } else {
      ssoConfig = await SSOConfig.create({ provider, enabled, config })
    }

    res.json(ssoConfig)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Email Settings Routes
router.get('/email', protect, admin, async (req, res) => {
  try {
    const settings = await EmailSettings.getSettings()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/email', protect, admin, async (req, res) => {
  try {
    const settings = await EmailSettings.getSettings()
    const { smtp, imap, domainRules } = req.body

    if (smtp) {
      // Trim credentials to remove accidental spaces (important for App Passwords)
      const trimmedUsername = smtp.username ? smtp.username.trim() : ''
      const trimmedPassword = smtp.password ? smtp.password.trim() : ''
      
      // Check if Office365
      const isOffice365 = smtp.host && (
        smtp.host.includes('office365.com') || 
        smtp.host.includes('outlook.com')
      )
      
      // For Office365: secure should be false (uses STARTTLS on port 587)
      // For other providers: secure is true for SSL (port 465)
      let secure = false
      if (!isOffice365) {
        secure = smtp.encryption === 'ssl' || (smtp.encryption === 'tls' && smtp.port === '465')
      }
      
      // Build auth object - support both OAuth2 and password auth
      const authConfig = {}
      if (smtp.auth?.oauth2?.enabled || smtp.useOAuth2) {
        // OAuth2 authentication
        authConfig.user = trimmedUsername
        authConfig.oauth2 = {
          enabled: true,
          clientId: smtp.auth?.oauth2?.clientId || smtp.oauth2?.clientId || '',
          clientSecret: smtp.auth?.oauth2?.clientSecret || smtp.oauth2?.clientSecret || '',
          refreshToken: smtp.auth?.oauth2?.refreshToken || smtp.oauth2?.refreshToken || '',
        }
      } else {
        // Password authentication
        authConfig.user = trimmedUsername
        authConfig.pass = trimmedPassword
        authConfig.oauth2 = {
          enabled: false,
        }
      }
      
      settings.smtp = {
        ...settings.smtp,
        host: smtp.host ? smtp.host.trim() : '',
        port: parseInt(smtp.port) || 587,
        secure: secure,
        auth: authConfig,
        fromEmail: smtp.fromEmail ? smtp.fromEmail.trim() : '',
        fromName: smtp.fromName ? smtp.fromName.trim() : '',
        enabled: true,
      }
    }
    
    if (imap) {
      // Convert encryption to secure boolean
      const secure = imap.encryption === 'ssl' || imap.encryption === 'tls'
      
      // Trim credentials to remove accidental spaces
      const trimmedUsername = imap.username ? imap.username.trim() : ''
      const trimmedPassword = imap.password ? imap.password.trim() : ''
      
      // Build auth object - support both OAuth2 and password auth
      const authConfig = {}
      if (imap.auth?.oauth2?.enabled || imap.useOAuth2) {
        // OAuth2 authentication
        authConfig.user = trimmedUsername
        authConfig.oauth2 = {
          enabled: true,
          clientId: imap.auth?.oauth2?.clientId || imap.oauth2?.clientId || '',
          clientSecret: imap.auth?.oauth2?.clientSecret || imap.oauth2?.clientSecret || '',
          refreshToken: imap.auth?.oauth2?.refreshToken || imap.oauth2?.refreshToken || '',
        }
      } else {
        // Password authentication
        authConfig.user = trimmedUsername
        authConfig.pass = trimmedPassword
        authConfig.oauth2 = {
          enabled: false,
        }
      }
      
      settings.imap = {
        ...settings.imap,
        host: imap.host ? imap.host.trim() : '',
        port: imap.port,
        secure: secure,
        auth: authConfig,
        folder: imap.folder || 'INBOX',
        enabled: true,
      }
    }

    if (domainRules) {
      // Check if organization has PRO plan for domain rules
      const User = (await import('../models/User.js')).default
      const Organization = (await import('../models/Organization.js')).default
      const user = await User.findById(req.user._id).populate('organization')
      const organization = user?.organization
      
      if (organization && organization.plan !== 'PRO') {
        return res.status(403).json({ 
          message: 'Domain Rules feature requires a Pro upgrade.',
          requiresUpgrade: true 
        })
      }

      const whitelist = normalizeDomainList(domainRules.whitelist || domainRules.allowlist)
      const blacklist = normalizeDomainList(domainRules.blacklist || domainRules.blocklist)
      const enabled = domainRules.enabled !== undefined ? Boolean(domainRules.enabled) : (settings.domainRules?.enabled ?? false)

      settings.domainRules = {
        enabled,
        whitelist,
        blacklist,
      }
    }

    await settings.save()
    res.json(settings)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Logo Routes
router.get('/logo', async (req, res) => {
  try {
    const logo = await Logo.getLogo()
    if (!logo) {
      return res.json({ logo: null, filename: null, showOnLogin: true, loginTitle: null })
    }
    res.json({ 
      logo: logo.logo,
      filename: logo.filename,
      showOnLogin: logo.showOnLogin !== undefined ? logo.showOnLogin : true,
      loginTitle: logo.loginTitle || null,
      createdAt: logo.createdAt,
      updatedAt: logo.updatedAt,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/logo', protect, admin, async (req, res) => {
  try {
    const { logo, filename, showOnLogin, loginTitle } = req.body
    
    // Find existing logo or create new one
    let existingLogo = await Logo.findOne().sort({ createdAt: -1 })
    
    if (existingLogo) {
      // Update existing logo
      if (logo !== undefined) existingLogo.logo = logo
      if (filename) existingLogo.filename = filename
      if (showOnLogin !== undefined) existingLogo.showOnLogin = showOnLogin
      if (loginTitle !== undefined) existingLogo.loginTitle = loginTitle || null
      await existingLogo.save()
      res.json({ 
        logo: existingLogo.logo,
        showOnLogin: existingLogo.showOnLogin !== undefined ? existingLogo.showOnLogin : true,
        loginTitle: existingLogo.loginTitle || null
      })
    } else {
      // Create new logo if none exists
      const newLogo = await Logo.create({ 
        logo, 
        filename: filename || 'logo',
        showOnLogin: showOnLogin !== undefined ? showOnLogin : true,
        loginTitle: loginTitle || null
      })
      res.json({ 
        logo: newLogo.logo,
        showOnLogin: newLogo.showOnLogin,
        loginTitle: newLogo.loginTitle || null
      })
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Delete logo route to remove demo logos
router.delete('/logo', protect, admin, async (req, res) => {
  try {
    await Logo.deleteMany({})
    res.json({ message: 'Logo deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Roles Routes (Custom roles require PRO)
router.get('/roles', protect, admin, async (req, res) => {
  try {
    const roles = await Role.find()
    res.json(roles)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/roles', protect, admin, async (req, res) => {
  try {
    // Check if organization has PRO plan for custom roles
    const User = (await import('../models/User.js')).default
    const Organization = (await import('../models/Organization.js')).default
    const user = await User.findById(req.user._id).populate('organization')
    const organization = user?.organization
    
    if (organization && organization.plan !== 'PRO') {
      return res.status(403).json({ 
        message: 'Custom Roles feature requires a Pro upgrade.',
        requiresUpgrade: true 
      })
    }

    const role = await Role.create(req.body)
    res.status(201).json(role)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/roles/:id', protect, admin, async (req, res) => {
  try {
    const role = await Role.findByIdAndUpdate(req.params.id, req.body, { new: true })
    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }
    res.json(role)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.delete('/roles/:id', protect, admin, async (req, res) => {
  try {
    const role = await Role.findByIdAndDelete(req.params.id)
    if (!role) {
      return res.status(404).json({ message: 'Role not found' })
    }
    res.json({ message: 'Role deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// SLA Policy Routes (PRO feature)
router.get('/sla', protect, admin, checkFeature('SLA_MANAGER'), async (req, res) => {
  try {
    const { organization } = req.query
    const query = {}
    
    if (organization) {
      query.$or = [
        { organization: organization },
        { organization: null }, // Include global policies
      ]
    } else {
      query.organization = null // Default to global policies
    }
    
    const policies = await SLAPolicy.find(query).populate('organization', 'name').sort({ priority: 1, organization: 1 })
    res.json(policies)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.post('/sla', protect, admin, checkFeature('SLA_MANAGER'), async (req, res) => {
  try {
    const { name, organization, priority, responseTime, resolutionTime, description, isActive } = req.body
    
    // Check if policy already exists for this organization and priority
    const existing = await SLAPolicy.findOne({
      organization: organization || null,
      priority,
    })
    
    if (existing) {
      // Update existing policy
      existing.name = name
      existing.responseTime = responseTime
      existing.resolutionTime = resolutionTime
      existing.description = description
      if (isActive !== undefined) existing.isActive = isActive
      await existing.save()
      const populated = await SLAPolicy.findById(existing._id).populate('organization', 'name')
      res.json(populated)
    } else {
      // Create new policy
      const policy = await SLAPolicy.create({
        name,
        organization: organization || null,
        priority,
        responseTime,
        resolutionTime,
        description,
        isActive: isActive !== undefined ? isActive : true,
      })
      const populated = await SLAPolicy.findById(policy._id).populate('organization', 'name')
      res.json(populated)
    }
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.put('/sla/:id', protect, admin, checkFeature('SLA_MANAGER'), async (req, res) => {
  try {
    const { name, responseTime, resolutionTime, description, isActive } = req.body
    const policy = await SLAPolicy.findById(req.params.id)
    
    if (!policy) {
      return res.status(404).json({ message: 'SLA Policy not found' })
    }
    
    if (name) policy.name = name
    if (responseTime !== undefined) policy.responseTime = responseTime
    if (resolutionTime !== undefined) policy.resolutionTime = resolutionTime
    if (description !== undefined) policy.description = description
    if (isActive !== undefined) policy.isActive = isActive
    
    await policy.save()
    const populated = await SLAPolicy.findById(policy._id).populate('organization', 'name')
    res.json(populated)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

router.delete('/sla/:id', protect, admin, checkFeature('SLA_MANAGER'), async (req, res) => {
  try {
    await SLAPolicy.findByIdAndDelete(req.params.id)
    res.json({ message: 'SLA Policy deleted successfully' })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// License Status Route
router.get('/license-status', protect, admin, async (req, res) => {
  try {
    // Re-check license
    checkLicense()
    const licenseState = getLicenseState()
    
    res.json({
      isValid: licenseState.isValid,
      isPro: licenseState.isPro,
      licenseId: licenseState.licenseData?.id || null,
      product: licenseState.licenseData?.product || null,
      tier: licenseState.licenseData?.tier || null,
      validity: licenseState.licenseData?.validity || null,
      lastChecked: licenseState.lastChecked
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Manual License Check Route (Image-Based - No DB Updates)
router.post('/license-check', protect, admin, async (req, res) => {
  try {
    // Re-check license file (image-based, no database updates)
    checkLicense()
    const licenseState = getLicenseState()
    
    res.json({
      success: true,
      licenseState: {
        isValid: licenseState.isValid,
        isPro: licenseState.isPro,
        licenseId: licenseState.licenseData?.id || null,
        product: licenseState.licenseData?.product || null,
        tier: licenseState.licenseData?.tier || null,
        validity: licenseState.licenseData?.validity || null,
        lastChecked: licenseState.lastChecked
      },
      message: licenseState.isPro 
        ? 'Pro features active (image-based activation)' 
        : 'Basic features active (no Pro license in image)'
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

// Activate License via Mathematical Validation
router.post('/activate-license', protect, admin, async (req, res) => {
  try {
    const { licenseKey } = req.body

    // Validate input is a number
    if (!licenseKey || (typeof licenseKey !== 'number' && typeof licenseKey !== 'string')) {
      return res.status(400).json({ message: 'License key is required and must be a number' })
    }

    // Convert to number if string
    const inputKey = typeof licenseKey === 'string' ? parseFloat(licenseKey.trim()) : licenseKey
    
    if (isNaN(inputKey) || !isFinite(inputKey)) {
      return res.status(400).json({ message: 'License key must be a valid number' })
    }

    // Calculate expected license key using formula: ((Current_Day * Current_Month * Current_Year) * Current_Year)
    const now = new Date()
    const currentDay = now.getUTCDate()
    const currentMonth = now.getUTCMonth() + 1 // getUTCMonth() returns 0-11, so add 1
    const currentYear = now.getUTCFullYear()
    
    // Formula: ((day * month * year) * year)
    const expectedKey = ((currentDay * currentMonth * currentYear) * currentYear)
    
    console.log(`[Activate License] Validation attempt:`)
    console.log(`  Current Date (UTC): ${currentDay}/${currentMonth}/${currentYear}`)
    console.log(`  Input Key: ${inputKey}`)
    console.log(`  Expected Key: ${expectedKey}`)
    console.log(`  Formula: ((${currentDay} * ${currentMonth} * ${currentYear}) * ${currentYear}) = ${expectedKey}`)

    // Validate the input matches the calculated key
    if (inputKey !== expectedKey) {
      return res.status(400).json({ 
        message: 'Invalid or Expired Key',
        hint: `Expected: ${expectedKey} (calculated from current date)`
      })
    }

    // Get user's organization
    const user = req.user
    if (!user.organization) {
      return res.status(400).json({ message: 'User is not associated with an organization' })
    }

    const orgId = typeof user.organization === 'object' 
      ? user.organization._id || user.organization.id
      : user.organization

    // Get organization name before update
    const existingOrg = await Organization.findById(orgId)
    if (!existingOrg) {
      return res.status(404).json({ message: 'Organization not found' })
    }

    // Create filesystem lock file FIRST (destructive activation)
    // This is the source of truth - if this fails, don't activate
    const lockCreated = createLockFile({
      date: now.toISOString(),
      organizationId: orgId.toString(),
      organizationName: existingOrg.name
    })

    if (!lockCreated) {
      return res.status(500).json({ 
        message: 'Failed to create lock file. Activation aborted. Please try again.' 
      })
    }

    // Update organization to PRO plan (keep plan in DB for reference, but Pro status relies on lock file)
    const organization = await Organization.findByIdAndUpdate(
      orgId,
      {
        $set: {
          plan: 'PRO',
          paymentStatus: 'VERIFIED',
          subscriptionExpiry: null
        },
        // Remove license trace (destructive activation)
        $unset: {
          paymentReference: '',
          paymentScreenshot: ''
        }
      },
      { new: true }
    )

    if (!organization) {
      // Lock file created but org update failed - delete lock file to maintain consistency
      const { deleteLockFile } = await import('../services/lockFileService.js')
      deleteLockFile()
      return res.status(404).json({ message: 'Organization not found. Lock file removed.' })
    }

    console.log(`[Activate License] ✅ Destructive activation complete for organization: ${organization.name} (${organization._id})`)
    console.log(`[Activate License] ⚠️  License trace removed from database. Pro status now relies on lock file.`)
    
    res.json({
      success: true,
      message: 'Pro license activated successfully. License trace removed from database.',
      organization: {
        id: organization._id,
        name: organization.name,
        plan: organization.plan,
        paymentStatus: organization.paymentStatus
      },
      warning: 'Pro status is now filesystem-based. If lock file is lost, you must purchase again.'
    })
  } catch (error) {
    console.error('[Activate License] Error:', error)
    const errorMessage = error.message || 'Failed to activate license'
    res.status(500).json({ 
      message: errorMessage,
      error: process.env.NODE_ENV === 'development' ? error.stack : undefined
    })
  }
})

export default router

