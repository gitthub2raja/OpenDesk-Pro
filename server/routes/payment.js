/**
 * Payment & Upgrade Management Routes
 * Handles payment submission and upgrade approval
 */

import express from 'express'
import multer from 'multer'
import path from 'path'
import { fileURLToPath } from 'url'
import Organization from '../models/Organization.js'
import User from '../models/User.js'
import { protect, admin } from '../middleware/auth.js'
import { sendEmail } from '../services/emailService.js'
import EmailSettings from '../models/EmailSettings.js'

const __filename = fileURLToPath(import.meta.url)
const __dirname = path.dirname(__filename)

const router = express.Router()

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, path.join(__dirname, '../uploads/payments'))
  },
  filename: (req, file, cb) => {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9)
    cb(null, `payment-${uniqueSuffix}${path.extname(file.originalname)}`)
  },
})

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: (req, file, cb) => {
    const allowedTypes = /jpeg|jpg|png|pdf/
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase())
    const mimetype = allowedTypes.test(file.mimetype)
    
    if (mimetype && extname) {
      return cb(null, true)
    } else {
      cb(new Error('Only image files (JPEG, PNG) and PDF files are allowed'))
    }
  },
})

/**
 * @route   POST /api/payment/submit-request
 * @desc    Submit upgrade payment request
 * @access  Private
 */
router.post('/submit-request', protect, upload.single('screenshot'), async (req, res) => {
  try {
    const { transactionId } = req.body
    
    if (!transactionId) {
      return res.status(400).json({ message: 'Transaction ID is required' })
    }

    // Get user's organization
    const user = await User.findById(req.user._id).populate('organization')
    if (!user || !user.organization) {
      return res.status(404).json({ message: 'Organization not found' })
    }

    const organization = user.organization

    // Check if already PRO
    if (organization.plan === 'PRO') {
      return res.status(400).json({ message: 'Organization is already on Pro plan' })
    }

    // Update organization with payment details
    organization.paymentReference = transactionId.trim()
    organization.paymentStatus = 'PENDING'
    
    // Store screenshot path if uploaded
    if (req.file) {
      organization.paymentScreenshot = `/api/uploads/payments/${req.file.filename}`
    }

    await organization.save()

    // Send email to super admin (first admin user or system admin)
    try {
      const adminUsers = await User.find({ role: 'admin' }).limit(5)
      const emailSettings = await EmailSettings.getSettings()

      if (emailSettings.smtp.enabled && adminUsers.length > 0) {
        const adminEmails = adminUsers.map(u => u.email).filter(Boolean)
        
        if (adminEmails.length > 0) {
          await sendEmail({
            to: adminEmails,
            subject: `New Pro Upgrade Request - ${organization.name}`,
            html: `
              <h2>New Pro Upgrade Request</h2>
              <p><strong>Organization:</strong> ${organization.name}</p>
              <p><strong>Transaction ID:</strong> ${transactionId}</p>
              <p><strong>Requested By:</strong> ${user.name} (${user.email})</p>
              <p><strong>Request Date:</strong> ${new Date().toLocaleString()}</p>
              ${req.file ? `<p><strong>Payment Screenshot:</strong> <a href="${process.env.FRONTEND_URL || 'http://localhost'}/api/uploads/payments/${req.file.filename}">View Screenshot</a></p>` : ''}
              <p>Please review and approve the upgrade request from the admin panel.</p>
            `,
          })
        }
      }
    } catch (emailError) {
      console.error('Error sending upgrade notification email:', emailError)
      // Don't fail the request if email fails
    }

    res.json({
      message: 'Upgrade request submitted successfully. Our team will review it shortly.',
      organization: {
        plan: organization.plan,
        paymentStatus: organization.paymentStatus,
      },
    })
  } catch (error) {
    console.error('Payment submission error:', error)
    res.status(500).json({ message: error.message || 'Error submitting payment request' })
  }
})

/**
 * @route   POST /api/admin/approve-upgrade
 * @desc    Approve organization upgrade to PRO (Super Admin only)
 * @access  Private/Admin
 */
router.post('/admin/approve-upgrade', protect, admin, async (req, res) => {
  try {
    const { organizationId, subscriptionMonths = 12 } = req.body

    if (!organizationId) {
      return res.status(400).json({ message: 'Organization ID is required' })
    }

    const organization = await Organization.findById(organizationId)
    if (!organization) {
      return res.status(404).json({ message: 'Organization not found' })
    }

    // Update organization to PRO
    organization.plan = 'PRO'
    organization.paymentStatus = 'VERIFIED'
    
    // Set subscription expiry (default 1 year from now)
    const expiryDate = new Date()
    expiryDate.setMonth(expiryDate.getMonth() + subscriptionMonths)
    organization.subscriptionExpiry = expiryDate

    await organization.save()

    // Notify organization admin
    try {
      const orgAdmin = await User.findOne({ 
        organization: organization._id, 
        role: 'admin' 
      })
      
      if (orgAdmin) {
        const emailSettings = await EmailSettings.getSettings()
        if (emailSettings.smtp.enabled) {
          await sendEmail({
            to: orgAdmin.email,
            subject: 'Your Pro Upgrade Has Been Approved!',
            html: `
              <h2>Pro Upgrade Approved</h2>
              <p>Congratulations! Your organization <strong>${organization.name}</strong> has been upgraded to the Pro plan.</p>
              <p><strong>Subscription Expires:</strong> ${expiryDate.toLocaleDateString()}</p>
              <p>You now have access to all Pro features including:</p>
              <ul>
                <li>SLA Management</li>
                <li>SSO Integration</li>
                <li>External Integrations</li>
                <li>Advanced Reports</li>
                <li>Email Automation</li>
                <li>Domain Rules</li>
                <li>Custom Roles</li>
                <li>Microsoft Teams Integration</li>
                <li>Azure Sentinel Integration</li>
              </ul>
              <p>Thank you for choosing our Pro plan!</p>
            `,
          })
        }
      }
    } catch (emailError) {
      console.error('Error sending approval email:', emailError)
      // Don't fail the request if email fails
    }

    res.json({
      message: 'Upgrade approved successfully',
      organization: {
        id: organization._id,
        name: organization.name,
        plan: organization.plan,
        paymentStatus: organization.paymentStatus,
        subscriptionExpiry: organization.subscriptionExpiry,
      },
    })
  } catch (error) {
    console.error('Upgrade approval error:', error)
    res.status(500).json({ message: error.message || 'Error approving upgrade' })
  }
})

/**
 * @route   GET /api/payment/status
 * @desc    Get current organization payment status
 * @access  Private
 */
router.get('/status', protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).populate('organization')
    if (!user || !user.organization) {
      return res.status(404).json({ message: 'Organization not found' })
    }

    const organization = user.organization

    res.json({
      plan: organization.plan,
      paymentStatus: organization.paymentStatus,
      subscriptionExpiry: organization.subscriptionExpiry,
      paymentReference: organization.paymentReference,
    })
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

/**
 * @route   GET /api/admin/pending-upgrades
 * @desc    Get all pending upgrade requests (Admin only)
 * @access  Private/Admin
 */
router.get('/admin/pending-upgrades', protect, admin, async (req, res) => {
  try {
    const organizations = await Organization.find({
      paymentStatus: 'PENDING',
      plan: 'BASIC',
    })
      .sort({ updatedAt: -1 })
      .select('name paymentReference paymentScreenshot createdAt updatedAt')

    res.json(organizations)
  } catch (error) {
    res.status(500).json({ message: error.message })
  }
})

export default router

