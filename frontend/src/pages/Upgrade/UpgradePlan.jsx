import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Card } from '../../components/ui/Card'
import { Button } from '../../components/ui/Button'
import { Input } from '../../components/ui/Input'
import { Modal } from '../../components/ui/Modal'
import { paymentAPI } from '../../services/api'
import { useAuth } from '../../contexts/AuthContext'
import { useFeatureAccess } from '../../hooks/useFeatureAccess'
import toast from 'react-hot-toast'
import { Check, X, Lock, Zap } from 'lucide-react'

export const UpgradePlan = () => {
  const navigate = useNavigate()
  const { user } = useAuth()
  const { plan, isPro } = useFeatureAccess()
  const [transactionId, setTransactionId] = useState('')
  const [screenshot, setScreenshot] = useState(null)
  const [screenshotPreview, setScreenshotPreview] = useState(null)
  const [loading, setLoading] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)

  // Pro plan pricing (in INR)
  const PRO_PRICE = 9999 // ₹9,999 per year

  const handleScreenshotChange = (e) => {
    const file = e.target.files[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        toast.error('File size must be less than 5MB')
        return
      }
      setScreenshot(file)
      
      // Create preview
      const reader = new FileReader()
      reader.onloadend = () => {
        setScreenshotPreview(reader.result)
      }
      reader.readAsDataURL(file)
    }
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    
    if (!transactionId.trim()) {
      toast.error('Transaction ID is required')
      return
    }

    setLoading(true)
    try {
      await paymentAPI.submitUpgradeRequest(transactionId.trim(), screenshot)
      toast.success('Upgrade request submitted successfully! Our team will review it shortly.')
      setTransactionId('')
      setScreenshot(null)
      setScreenshotPreview(null)
      setShowUpgradeModal(false)
    } catch (error) {
      toast.error(error.message || 'Failed to submit upgrade request')
    } finally {
      setLoading(false)
    }
  }

  // If already Pro, show success message
  if (isPro) {
    return (
      <div className="max-w-4xl mx-auto p-6">
        <Card className="p-8 text-center">
          <div className="flex justify-center mb-4">
            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center">
              <Check className="w-8 h-8 text-green-600" />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">You're on Pro Plan!</h2>
          <p className="text-gray-600 mb-6">
            You have access to all Pro features. Thank you for your subscription!
          </p>
          <Button onClick={() => navigate('/dashboard')}>
            Go to Dashboard
          </Button>
        </Card>
      </div>
    )
  }

  const features = {
    basic: [
      { name: 'Ticket Management', included: true },
      { name: 'Email Integration (SMTP/IMAP)', included: true },
      { name: 'User & Department Management', included: true },
      { name: 'Basic Reports', included: true },
      { name: 'API Keys', included: true },
      { name: 'Email Templates', included: true },
      { name: 'FAQ Management', included: true },
      { name: 'Chatbot', included: true },
      { name: 'SLA Management', included: false },
      { name: 'SSO Integration', included: false },
      { name: 'External Integrations', included: false },
      { name: 'Advanced Reports & Analytics', included: false },
      { name: 'Email Automation', included: false },
      { name: 'Domain Rules (Whitelist/Blacklist)', included: false },
      { name: 'Custom Roles', included: false },
      { name: 'Microsoft Teams Integration', included: false },
      { name: 'Azure Sentinel Integration', included: false },
    ],
    pro: [
      { name: 'Ticket Management', included: true },
      { name: 'Email Integration (SMTP/IMAP)', included: true },
      { name: 'User & Department Management', included: true },
      { name: 'Basic Reports', included: true },
      { name: 'API Keys', included: true },
      { name: 'Email Templates', included: true },
      { name: 'FAQ Management', included: true },
      { name: 'Chatbot', included: true },
      { name: 'SLA Management', included: true },
      { name: 'SSO Integration', included: true },
      { name: 'External Integrations', included: true },
      { name: 'Advanced Reports & Analytics', included: true },
      { name: 'Email Automation', included: true },
      { name: 'Domain Rules (Whitelist/Blacklist)', included: true },
      { name: 'Custom Roles', included: true },
      { name: 'Microsoft Teams Integration', included: true },
      { name: 'Azure Sentinel Integration', included: true },
    ],
  }

  return (
    <div className="max-w-6xl mx-auto p-6">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Upgrade to Pro</h1>
        <p className="text-gray-600">Unlock all premium features and take your ticketing system to the next level</p>
      </div>

      {/* Comparison Table */}
      <div className="grid md:grid-cols-2 gap-6 mb-8">
        {/* Basic Plan */}
        <Card className="p-6">
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Basic Plan</h3>
            <div className="text-3xl font-bold text-gray-900 mb-1">Free</div>
            <p className="text-sm text-gray-600">Perfect for getting started</p>
          </div>
          <ul className="space-y-3 mb-6">
            {features.basic.map((feature, idx) => (
              <li key={idx} className="flex items-start">
                {feature.included ? (
                  <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                ) : (
                  <X className="w-5 h-5 text-gray-400 mr-2 flex-shrink-0 mt-0.5" />
                )}
                <span className={feature.included ? 'text-gray-900' : 'text-gray-400 line-through'}>
                  {feature.name}
                </span>
              </li>
            ))}
          </ul>
          <div className="text-center">
            <div className="inline-flex items-center px-4 py-2 bg-gray-100 rounded-lg text-gray-700 font-medium">
              Current Plan
            </div>
          </div>
        </Card>

        {/* Pro Plan */}
        <Card className="p-6 border-2 border-primary-500 relative">
          <div className="absolute top-4 right-4">
            <span className="bg-primary-500 text-white text-xs font-bold px-3 py-1 rounded-full">
              RECOMMENDED
            </span>
          </div>
          <div className="text-center mb-6">
            <h3 className="text-xl font-bold text-gray-900 mb-2">Pro Plan</h3>
            <div className="text-3xl font-bold text-primary-600 mb-1">₹{PRO_PRICE.toLocaleString()}</div>
            <p className="text-sm text-gray-600">per year</p>
          </div>
          <ul className="space-y-3 mb-6">
            {features.pro.map((feature, idx) => (
              <li key={idx} className="flex items-start">
                <Check className="w-5 h-5 text-green-600 mr-2 flex-shrink-0 mt-0.5" />
                <span className="text-gray-900">{feature.name}</span>
              </li>
            ))}
          </ul>
          <div className="text-center">
            <Button
              onClick={() => setShowUpgradeModal(true)}
              className="w-full"
              size="lg"
            >
              <Zap className="w-5 h-5 mr-2" />
              Upgrade to Pro
            </Button>
          </div>
        </Card>
      </div>

      {/* Payment Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => {
          setShowUpgradeModal(false)
          setTransactionId('')
          setScreenshot(null)
          setScreenshotPreview(null)
        }}
        title="Upgrade to Pro Plan"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div>
            <p className="text-gray-700 mb-4">
              To upgrade, please pay <strong className="text-primary-600">₹{PRO_PRICE.toLocaleString()}</strong> via UPI/GPay/Paytm.
            </p>
            
            {/* QR Code Placeholder */}
            <div className="bg-gray-100 border-2 border-dashed border-gray-300 rounded-lg p-8 mb-4 text-center">
              <div className="w-48 h-48 mx-auto bg-white rounded-lg flex items-center justify-center mb-4">
                <div className="text-gray-400 text-sm">QR Code Placeholder</div>
              </div>
              <p className="text-sm text-gray-600 mb-2">Scan to pay via UPI</p>
              <p className="text-lg font-mono font-semibold text-gray-900">admin@upi</p>
            </div>

            <div className="space-y-4">
              <Input
                label="Transaction/Reference ID *"
                type="text"
                value={transactionId}
                onChange={(e) => setTransactionId(e.target.value)}
                placeholder="Enter your UPI transaction ID"
                required
              />

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Upload Payment Screenshot (Optional)
                </label>
                <input
                  type="file"
                  accept="image/*,.pdf"
                  onChange={handleScreenshotChange}
                  className="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-semibold file:bg-primary-50 file:text-primary-700 hover:file:bg-primary-100"
                />
                {screenshotPreview && (
                  <div className="mt-4">
                    <img
                      src={screenshotPreview}
                      alt="Screenshot preview"
                      className="max-w-xs rounded-lg border border-gray-300"
                    />
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        setScreenshot(null)
                        setScreenshotPreview(null)
                      }}
                      className="mt-2"
                    >
                      Remove
                    </Button>
                  </div>
                )}
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setShowUpgradeModal(false)
                setTransactionId('')
                setScreenshot(null)
                setScreenshotPreview(null)
              }}
            >
              Cancel
            </Button>
            <Button type="submit" loading={loading}>
              Submit Upgrade Request
            </Button>
          </div>
        </form>
      </Modal>
    </div>
  )
}

export default UpgradePlan

