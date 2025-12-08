import { useState, useEffect } from 'react'
import { Layout } from '../components/layout/Layout'
import { Card } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Select } from '../components/ui/Select'
import { Badge } from '../components/ui/Badge'
import { Modal } from '../components/ui/Modal'
import { useAuth } from '../contexts/AuthContext'
import { useFeatureAccess } from '../hooks/useFeatureAccess'
import { useSound } from '../utils/soundEffects'
import { adminAPI } from '../services/api'
import { authAPI } from '../services/api'
import { Settings as SettingsIcon, Bell, Globe, Moon, Sun, Volume2, VolumeX, CreditCard, Lock, CheckCircle, User } from 'lucide-react'
import toast from 'react-hot-toast'

export const Settings = () => {
  const { user, updateUser } = useAuth()
  const { plan, isPro } = useFeatureAccess()
  const { enabled: soundEnabled, setEnabled: setSoundEnabled } = useSound()
  const [activeTab, setActiveTab] = useState('notifications')
  const [showLicenseModal, setShowLicenseModal] = useState(false)
  const [licenseKey, setLicenseKey] = useState('')
  const [activating, setActivating] = useState(false)
  
  // Check database plan (not file-based license) to determine if activation should be shown
  const dbPlan = user?.organization && typeof user.organization === 'object' 
    ? user.organization.plan 
    : 'BASIC'
  // Show activation for Basic plan users OR admins (admins can always activate)
  const showActivation = dbPlan === 'BASIC' || user?.role === 'admin'
  const [notifications, setNotifications] = useState({
    email: true,
    push: false,
    ticketUpdates: true,
    comments: true,
  })
  const [preferences, setPreferences] = useState({
    language: 'en',
    timezone: 'UTC',
    theme: 'light',
  })
  const [loading, setLoading] = useState(false)

  const handleNotificationChange = (key) => {
    setNotifications({ ...notifications, [key]: !notifications[key] })
  }

  const handlePreferenceChange = (key, value) => {
    setPreferences({ ...preferences, [key]: value })
  }

  const handleSave = async () => {
    setLoading(true)
    setTimeout(() => {
      toast.success('Settings saved successfully!')
      setLoading(false)
    }, 1000)
  }

  const handleActivateLicense = async () => {
    // Convert to number
    const numericKey = typeof licenseKey === 'string' ? parseFloat(licenseKey.trim()) : licenseKey
    
    if (!licenseKey || isNaN(numericKey) || !isFinite(numericKey)) {
      toast.error('Please enter a valid numeric license key')
      return
    }

    setActivating(true)
    try {
      const response = await adminAPI.activateLicense(numericKey)
      
      // Refresh user data to get updated organization
      const userData = await authAPI.getMe()
      if (userData.organization) {
        const orgId = typeof userData.organization === 'object' 
          ? userData.organization._id || userData.organization.id
          : userData.organization
        
        if (orgId) {
          const orgData = await authAPI.getOrganization(orgId)
          userData.organization = orgData
        }
      }
      
      updateUser(userData)
      
      toast.success('Pro license activated successfully! All Pro features are now unlocked.')
      setShowLicenseModal(false)
      setLicenseKey('')
    } catch (error) {
      console.error('License activation error:', error)
      // Extract error message from response
      let errorMessage = 'Invalid or Expired Key'
      if (error.message) {
        errorMessage = error.message
      } else if (error.response?.data?.message) {
        errorMessage = error.response.data.message
      }
      toast.error(errorMessage)
    } finally {
      setActivating(false)
    }
  }

  const tabs = [
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'preferences', label: 'Preferences', icon: SettingsIcon },
    { id: 'subscription', label: 'Subscription', icon: CreditCard },
    { id: 'account', label: 'Account', icon: User },
  ]

  return (
    <Layout>
      <div className="max-w-4xl mx-auto space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Settings</h1>
          <p className="text-gray-600 mt-1">Manage your account settings and preferences</p>
        </div>

        {/* Tabs */}
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8">
            {tabs.map((tab) => {
              const Icon = tab.icon
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 py-4 px-1 border-b-2 font-medium text-sm transition-colors ${
                    activeTab === tab.id
                      ? 'border-primary-600 text-primary-600'
                      : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                  }`}
                >
                  <Icon size={18} />
                  <span>{tab.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Subscription Tab */}
        {activeTab === 'subscription' && (
          <Card title="Subscription & License">
            <div className="space-y-6">
              <div className="p-6 bg-gradient-to-r from-primary-50 to-blue-50 rounded-lg border border-primary-200">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">Current Plan</h3>
                      <Badge variant={isPro ? 'success' : 'info'} className="text-sm">
                        {plan}
                      </Badge>
                    </div>
                    <p className="text-sm text-gray-600 mb-4">
                      {isPro 
                        ? 'You have access to all Pro features including SLA Management, SSO Integration, Teams Integration, and more.'
                        : 'You are currently on the Basic plan. Upgrade to Pro to unlock advanced features.'}
                    </p>
                    
                    {/* Always show activation button for admins, or for Basic plan users */}
                    {(user?.role === 'admin' || dbPlan === 'BASIC') && (
                      <div className="space-y-3">
                        {user?.role === 'admin' && dbPlan === 'PRO' && (
                          <p className="text-xs text-amber-600 bg-amber-50 p-2 rounded border border-amber-200">
                            Database plan is PRO. You can activate a new license to update the organization.
                          </p>
                        )}
                        <Button
                          onClick={() => setShowLicenseModal(true)}
                          className="flex items-center space-x-2"
                        >
                          <CreditCard size={18} />
                          <span>Activate License</span>
                        </Button>
                      </div>
                    )}
                    
                    {isPro && (
                      <div className="flex items-center space-x-2 text-green-600">
                        <CheckCircle size={18} />
                        <span className="text-sm font-medium">Pro features are active</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {isPro && (
                <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                  <div className="flex items-start space-x-3">
                    <CheckCircle className="text-green-600 mt-0.5" size={20} />
                    <div>
                      <h4 className="font-semibold text-green-900 mb-1">Pro Features Unlocked</h4>
                      <ul className="text-sm text-green-700 space-y-1">
                        <li>• SLA Management</li>
                        <li>• SSO Integration</li>
                        <li>• Microsoft Teams Integration</li>
                        <li>• Advanced Reports & Analytics</li>
                        <li>• Email Automation</li>
                        <li>• External Integrations</li>
                        <li>• Custom Roles</li>
                        <li>• Domain Rules</li>
                      </ul>
                    </div>
                  </div>
                </div>
              )}
            </div>
          </Card>
        )}

        {/* Notifications Tab */}
        {activeTab === 'notifications' && (
          <>
            {/* Notification Settings */}
            <Card title="Notification Preferences">
              <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="text-primary-600" size={20} />
                <div>
                  <h3 className="font-medium text-gray-900">Email Notifications</h3>
                  <p className="text-sm text-gray-600">Receive notifications via email</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.email}
                  onChange={() => handleNotificationChange('email')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="text-primary-600" size={20} />
                <div>
                  <h3 className="font-medium text-gray-900">Push Notifications</h3>
                  <p className="text-sm text-gray-600">Receive browser push notifications</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.push}
                  onChange={() => handleNotificationChange('push')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="text-primary-600" size={20} />
                <div>
                  <h3 className="font-medium text-gray-900">Ticket Updates</h3>
                  <p className="text-sm text-gray-600">Get notified when tickets are updated</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.ticketUpdates}
                  onChange={() => handleNotificationChange('ticketUpdates')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>

            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                <Bell className="text-primary-600" size={20} />
                <div>
                  <h3 className="font-medium text-gray-900">New Comments</h3>
                  <p className="text-sm text-gray-600">Get notified when new comments are added</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={notifications.comments}
                  onChange={() => handleNotificationChange('comments')}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
              </div>
            </Card>
          </>
        )}

        {/* Preferences Tab */}
        {activeTab === 'preferences' && (
          <>
            {/* General Preferences */}
            <Card title="General Preferences">
              <div className="space-y-4">
            <Select
              label="Language"
              value={preferences.language}
              onChange={(e) => handlePreferenceChange('language', e.target.value)}
              options={[
                { value: 'en', label: 'English' },
                { value: 'es', label: 'Spanish' },
                { value: 'fr', label: 'French' },
                { value: 'de', label: 'German' },
              ]}
            />

            <Select
              label="Timezone"
              value={preferences.timezone}
              onChange={(e) => handlePreferenceChange('timezone', e.target.value)}
              options={[
                { value: 'UTC', label: 'UTC' },
                { value: 'America/New_York', label: 'Eastern Time (ET)' },
                { value: 'America/Chicago', label: 'Central Time (CT)' },
                { value: 'America/Denver', label: 'Mountain Time (MT)' },
                { value: 'America/Los_Angeles', label: 'Pacific Time (PT)' },
                { value: 'Europe/London', label: 'London (GMT)' },
                { value: 'Europe/Paris', label: 'Paris (CET)' },
                { value: 'Asia/Tokyo', label: 'Tokyo (JST)' },
              ]}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">Theme</label>
              <div className="flex space-x-4">
                <button
                  onClick={() => handlePreferenceChange('theme', 'light')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    preferences.theme === 'light'
                      ? 'border-primary-600 bg-primary-50 text-primary-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Sun size={20} />
                  <span>Light</span>
                </button>
                <button
                  onClick={() => handlePreferenceChange('theme', 'dark')}
                  className={`flex items-center space-x-2 px-4 py-2 rounded-lg border-2 transition-colors ${
                    preferences.theme === 'dark'
                      ? 'border-primary-600 bg-primary-50 text-primary-600'
                      : 'border-gray-200 hover:border-gray-300'
                  }`}
                >
                  <Moon size={20} />
                  <span>Dark</span>
                </button>
              </div>
            </div>

            {/* Sound Effects Toggle */}
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-3">
                {soundEnabled ? (
                  <Volume2 className="text-primary-600" size={20} />
                ) : (
                  <VolumeX className="text-gray-400" size={20} />
                )}
                <div>
                  <h3 className="font-medium text-gray-900">Button Sounds</h3>
                  <p className="text-sm text-gray-600">Enable or disable sound effects for button clicks</p>
                </div>
              </div>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={soundEnabled}
                  onChange={(e) => {
                    setSoundEnabled(e.target.checked)
                    toast.success(`Button sounds ${e.target.checked ? 'enabled' : 'disabled'}`)
                  }}
                  className="sr-only peer"
                />
                <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none peer-focus:ring-4 peer-focus:ring-primary-300 rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-primary-600"></div>
              </label>
            </div>
              </div>
            </Card>
          </>
        )}

        {/* Account Tab */}
        {activeTab === 'account' && (
          <Card title="Account Information">
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                <p className="text-gray-900">{user?.email || 'N/A'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Role</label>
                <Badge variant={user?.role === 'admin' ? 'danger' : user?.role === 'technician' ? 'info' : 'info'}>
                  {user?.role || 'user'}
                </Badge>
              </div>
            </div>
          </Card>
        )}

        {activeTab !== 'subscription' && activeTab !== 'account' && (
          <div className="flex justify-end">
            <Button onClick={handleSave} disabled={loading}>
              {loading ? 'Saving...' : 'Save Settings'}
            </Button>
          </div>
        )}

        {/* License Activation Modal */}
        <Modal
          isOpen={showLicenseModal}
          onClose={() => {
            setShowLicenseModal(false)
            setLicenseKey('')
          }}
          title="Activate Pro License"
          size="md"
        >
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Enter License Key
              </label>
              <Input
                type="number"
                value={licenseKey}
                onChange={(e) => setLicenseKey(e.target.value)}
                placeholder="Enter license key"
                className="w-full text-lg font-mono"
                min="0"
                step="1"
              />
            </div>

            <div className="flex gap-2 justify-end pt-2">
              <Button
                variant="outline"
                onClick={() => {
                  setShowLicenseModal(false)
                  setLicenseKey('')
                }}
                disabled={activating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleActivateLicense}
                disabled={activating || !licenseKey || isNaN(parseFloat(licenseKey))}
              >
                {activating ? 'Verifying...' : 'Verify & Activate'}
              </Button>
            </div>
          </div>
        </Modal>
      </div>
    </Layout>
  )
}

