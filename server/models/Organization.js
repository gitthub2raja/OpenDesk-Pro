import mongoose from 'mongoose'

const organizationSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  domain: {
    type: String,
    trim: true,
    lowercase: true,
    default: null,
  },
  description: {
    type: String,
    trim: true,
    default: '',
  },
  status: {
    type: String,
    enum: ['active', 'inactive'],
    default: 'active',
  },
  settings: {
    allowSelfRegistration: {
      type: Boolean,
      default: false,
    },
    defaultRole: {
      type: String,
      enum: ['user', 'agent'],
      default: 'user',
    },
  },
  // Freemium Plan Management
  plan: {
    type: String,
    enum: ['BASIC', 'PRO'],
    default: 'BASIC',
  },
  subscriptionExpiry: {
    type: Date,
    default: null,
  },
  paymentReference: {
    type: String,
    default: null,
    trim: true,
  },
  paymentStatus: {
    type: String,
    enum: ['PENDING', 'VERIFIED', 'FAILED'],
    default: 'VERIFIED', // Basic plan is verified by default
  },
  paymentScreenshot: {
    type: String,
    default: null,
  },
}, {
  timestamps: true,
})

export default mongoose.model('Organization', organizationSchema)

