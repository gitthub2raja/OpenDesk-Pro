import { NavLink, useLocation } from 'react-router-dom'
import { useState } from 'react'
import { 
  LayoutDashboard, 
  Ticket, 
  Settings, 
  Users, 
  Shield,
  Mail,
  User,
  LogOut,
  Image as ImageIcon,
  Building2,
  Tag,
  X,
  Clock,
  FileText,
  Briefcase,
  Upload,
  BarChart3,
  Key,
  MessageSquare,
  Send,
  HelpCircle,
  Database,
  FileCode,
  Hash,
  Hash as HashIcon,
  CheckCircle,
  XCircle,
  Info,
  Edit3,
  Plug,
  Lock
} from 'lucide-react'
import { useAuth } from '../../contexts/AuthContext'
import { useLogo } from '../../contexts/LogoContext'
import { useFeatureAccess } from '../../hooks/useFeatureAccess'
import { useNavigate } from 'react-router-dom'
import { Modal } from '../ui/Modal'
import { Input } from '../ui/Input'
import { Button } from '../ui/Button'
import toast from 'react-hot-toast'

const getMenuItems = (userRole) => {
  const items = [
    { path: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
    { path: '/tickets', icon: Ticket, label: 'Tickets' },
  ]
  
  // Only show Reports for admins and agents (but show with lock if Basic)
  if (userRole === 'admin' || userRole === 'technician') {
    items.push({ path: '/reports', icon: FileText, label: 'Reports', feature: null })
  }
  
  items.push({ path: '/settings', icon: Settings, label: 'Settings' })
  
  return items
}

// Feature mapping for admin menu items
const adminMenuItems = [
  { path: '/admin/organizations', icon: Building2, label: 'Organizations', feature: null },
  { path: '/admin/users', icon: Users, label: 'Users', feature: null },
  { path: '/admin/categories', icon: Tag, label: 'Categories', feature: null },
  { path: '/admin/departments', icon: Briefcase, label: 'Departments', feature: null },
  { path: '/admin/roles', icon: Shield, label: 'Roles', feature: 'CUSTOM_ROLES' },
  { path: '/admin/sla', icon: Clock, label: 'SLA Policies', feature: 'SLA_MANAGER' },
  { path: '/admin/tickets/import', icon: Upload, label: 'Import Tickets', feature: null },
  { path: '/admin/analytics', icon: BarChart3, label: 'Analytics', feature: 'ADVANCED_REPORTS' },
  { path: '/admin/api-keys', icon: Key, label: 'API Keys', feature: null },
  { path: '/admin/integrations', icon: Plug, label: 'External Integrations', feature: 'EXTERNAL_INTEGRATIONS' },
  { path: '/admin/email', icon: Mail, label: 'Email Settings', feature: null },
  { path: '/admin/domain-rules', icon: Shield, label: 'Domain Rules', feature: 'DOMAIN_RULES' },
  { path: '/admin/email-templates', icon: FileCode, label: 'Email Templates', feature: null },
  { path: '/admin/email-automation', icon: Send, label: 'Email Automation', feature: 'EMAIL_AUTOMATION' },
  { path: '/admin/faq', icon: HelpCircle, label: 'FAQ Management', feature: null },
  { path: '/admin/chat-history', icon: MessageSquare, label: 'Chat History', feature: null },
  { path: '/admin/teams-integration', icon: MessageSquare, label: 'Microsoft Teams', feature: 'TEAMS_INTEGRATION' },
  { path: '/admin/sso', icon: Shield, label: 'SSO Configuration', feature: 'SSO_INTEGRATION' },
  { path: '/admin/logo', icon: ImageIcon, label: 'Logo Management', feature: null },
  { path: '/admin/backup-restore', icon: Database, label: 'Backup & Restore', feature: null },
]

const NavItem = ({ item, onClick, hasAccess, onUpgradeClick }) => {
  const location = useLocation()
  const isActive = location.pathname === item.path
  const Icon = item.icon
  const isLocked = item.feature && !hasAccess

  const handleClick = (e) => {
    if (isLocked) {
      e.preventDefault()
      if (onUpgradeClick) {
        onUpgradeClick()
      }
      return
    }
    if (onClick) {
      onClick()
    }
  }

  const content = (
    <>
      <Icon size={20} className={`mr-3 ${isActive ? 'text-primary-600' : isLocked ? 'text-gray-400' : 'text-gray-500 group-hover:text-primary-600'} transition-colors`} />
      <span className="text-sm flex-1">{item.label}</span>
      {isLocked && (
        <Lock size={14} className="text-gray-400 ml-2" />
      )}
      {isActive && !isLocked && (
        <div className="absolute right-2 w-2 h-2 bg-primary-600 rounded-full animate-glow-pulse shadow-lg shadow-primary-500/50" />
      )}
    </>
  )

  if (isLocked) {
    return (
      <div
        onClick={handleClick}
        className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative group cursor-pointer ${
          'text-gray-400 cursor-pointer opacity-75 hover:opacity-100 hover:bg-white/20'
        }`}
      >
        {content}
      </div>
    )
  }

  return (
    <NavLink
      to={item.path}
      onClick={handleClick}
      className={`flex items-center px-4 py-3 rounded-xl transition-all duration-300 relative group ${
        isActive 
          ? 'bg-gradient-to-r from-primary-500/20 via-primary-500/15 to-primary-500/10 text-primary-700 font-semibold backdrop-blur-md border border-primary-500/30 shadow-lg shadow-primary-500/20' 
          : 'text-gray-700 hover:bg-white/40 hover:backdrop-blur-md hover:text-gray-900 hover:border hover:border-white/30 hover:shadow-md'
      }`}
      style={{
        backgroundColor: isActive 
          ? 'rgba(14, 165, 233, 0.15)' 
          : 'transparent',
      }}
    >
      {content}
    </NavLink>
  )
}

export const Sidebar = ({ isOpen, onClose }) => {
  const { user, logout } = useAuth()
  const { logo } = useLogo()
  const { hasAccess } = useFeatureAccess()
  const navigate = useNavigate()
  const isAdmin = user?.role === 'admin'
  const isDepartmentHead = user?.role === 'department-head'
  const [showTicketIdModal, setShowTicketIdModal] = useState(false)
  const [showUpgradeModal, setShowUpgradeModal] = useState(false)
  const [manualTicketId, setManualTicketId] = useState(() => {
    return localStorage.getItem('manualTicketId') || ''
  })

  const handleSetTicketId = () => {
    if (!isAdmin) return
    const ticketId = parseInt(manualTicketId)
    if (isNaN(ticketId) || ticketId < 1) {
      toast.error('Please enter a valid ticket ID (must be a positive number)')
      return
    }
    localStorage.setItem('manualTicketId', ticketId.toString())
    localStorage.setItem('useManualTicketId', 'true')
    toast.success(`Manual ticket ID set to ${ticketId}. New tickets will continue from this ID.`)
    setShowTicketIdModal(false)
  }

  const handleClearTicketId = () => {
    localStorage.removeItem('manualTicketId')
    localStorage.removeItem('useManualTicketId')
    setManualTicketId('')
    toast.success('Manual ticket ID cleared. System will use auto-increment.')
    setShowTicketIdModal(false)
  }

  return (
    <>
      {/* Mobile overlay */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-gray-900/40 backdrop-blur-sm z-20 lg:hidden transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar with transparent glass effect */}
      <aside
        className={`fixed top-0 left-0 z-30 h-full w-64 transform transition-transform duration-300 ease-in-out lg:translate-x-0 ${
          isOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
        style={{
          background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.7) 0%, rgba(255, 255, 255, 0.5) 100%)',
          backdropFilter: 'blur(20px) saturate(180%)',
          WebkitBackdropFilter: 'blur(20px) saturate(180%)',
          borderRight: '1px solid rgba(255, 255, 255, 0.3)',
          boxShadow: '0 8px 32px 0 rgba(0, 0, 0, 0.1)',
        }}
      >
        <div className="flex flex-col h-full">
          {/* Logo Header with transparent effect */}
          <div 
            className="flex items-center justify-between h-16 px-6 border-b"
            style={{
              borderColor: 'rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(135deg, rgba(255, 255, 255, 0.8) 0%, rgba(255, 255, 255, 0.6) 100%)',
            }}
          >
            <div className="flex items-center space-x-3">
              <div 
                className="w-10 h-10 rounded-xl flex items-center justify-center shadow-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(14, 165, 233, 0.8) 0%, rgba(2, 132, 199, 0.9) 100%)',
                  boxShadow: '0 4px 15px rgba(14, 165, 233, 0.3)',
                }}
              >
                <img 
                  src={logo} 
                  alt="Logo" 
                  className="h-8 w-auto"
                  onError={(e) => {
                    e.target.src = '/logo.svg'
                  }}
                />
              </div>
              <span className="text-lg font-bold bg-gradient-to-r from-gray-900 to-gray-700 bg-clip-text text-transparent">
                Ticketing Tool
              </span>
            </div>
            <button
              onClick={onClose}
              className="lg:hidden text-gray-500 hover:text-gray-700 transition-colors p-1 rounded-lg hover:bg-white/40 backdrop-blur-sm"
            >
              <X size={24} />
            </button>
          </div>

                {/* Navigation */}
                <nav className="flex-1 px-4 py-4 space-y-1 overflow-y-auto">
                  {getMenuItems(user?.role).map((item) => (
                    <NavItem
                      key={item.path}
                      item={item}
                      hasAccess={item.feature ? hasAccess(item.feature) : true}
                      onClick={() => window.innerWidth < 1024 && onClose()}
                      onUpgradeClick={() => {
                        setShowUpgradeModal(true)
                        if (window.innerWidth < 1024) onClose()
                      }}
                    />
                  ))}

            {isAdmin && (
              <>
                <div className="pt-4 mt-4 border-t" style={{ borderColor: 'rgba(0, 0, 0, 0.08)' }}>
                  <p className="px-4 text-xs font-bold text-gray-500 uppercase tracking-wider mb-2">
                    Administration
                  </p>
                </div>
                {adminMenuItems.map((item) => (
                  <NavItem
                    key={item.path}
                    item={item}
                    hasAccess={item.feature ? hasAccess(item.feature) : true}
                    onClick={() => window.innerWidth < 1024 && onClose()}
                    onUpgradeClick={() => {
                      setShowUpgradeModal(true)
                      if (window.innerWidth < 1024) onClose()
                    }}
                  />
                ))}
              </>
            )}
          </nav>

          {/* User section with transparent effect */}
          <div 
            className="p-4 border-t"
            style={{
              borderColor: 'rgba(0, 0, 0, 0.08)',
              background: 'linear-gradient(to top, rgba(255, 255, 255, 0.6) 0%, transparent 100%)',
            }}
          >
            {isAdmin && (
              <button
                onClick={() => {
                  setShowTicketIdModal(true)
                  if (window.innerWidth < 1024) onClose()
                }}
                className="w-full flex items-center px-4 py-3 text-gray-700 rounded-xl transition-all duration-300 mb-2 backdrop-blur-md hover:bg-white/50 hover:text-gray-900 border border-transparent hover:border-white/40 shadow-sm hover:shadow-md group"
              >
                <div className="relative">
                  <Hash size={20} className="mr-3 text-gray-500 group-hover:text-primary-600 transition-colors" />
                  {localStorage.getItem('manualTicketId') && (
                    <CheckCircle size={12} className="absolute -top-1 -right-1 text-green-500 bg-white rounded-full" />
                  )}
                </div>
                <span className="text-sm font-medium">Manual Ticket ID</span>
                {localStorage.getItem('manualTicketId') && (
                  <span className="ml-auto flex items-center gap-1 text-xs font-semibold text-primary-600 bg-primary-50 px-2 py-1 rounded-full">
                    <HashIcon size={12} />
                    #{localStorage.getItem('manualTicketId')}
                  </span>
                )}
              </button>
            )}
            <NavLink
              to="/profile"
              onClick={() => window.innerWidth < 1024 && onClose()}
              className="flex items-center px-4 py-3 text-gray-700 rounded-xl transition-all duration-300 mb-2 backdrop-blur-md hover:bg-white/50 hover:text-gray-900 border border-transparent hover:border-white/40 shadow-sm hover:shadow-md"
            >
              <User size={20} className="mr-3 text-gray-500" />
              <span className="text-sm font-medium">Profile</span>
            </NavLink>
            <button
              onClick={logout}
              className="w-full flex items-center px-4 py-3 text-red-600 rounded-xl transition-all duration-300 backdrop-blur-md hover:bg-red-500/20 hover:text-red-700 border border-transparent hover:border-red-500/30 shadow-sm hover:shadow-md"
            >
              <LogOut size={20} className="mr-3" />
              <span className="text-sm font-medium">Logout</span>
            </button>
          </div>
        </div>
      </aside>

      {/* Manual Ticket ID Modal */}
      {isAdmin && (
        <Modal
          isOpen={showTicketIdModal}
          onClose={() => setShowTicketIdModal(false)}
          title={
            <div className="flex items-center gap-2">
              <div className="p-2 bg-primary-100 rounded-lg">
                <HashIcon size={20} className="text-primary-600" />
              </div>
              <span>Set Manual Ticket ID</span>
            </div>
          }
        >
          <div className="space-y-4">
            <div className="flex items-start gap-3 p-3 bg-blue-50 border border-blue-200 rounded-lg">
              <Info size={18} className="text-blue-600 mt-0.5 flex-shrink-0" />
              <p className="text-sm text-gray-700">
                Set a starting ticket ID. Once set, new tickets will continue sequentially from this ID.
                Leave empty to use auto-increment from the highest existing ticket ID.
              </p>
            </div>
            
            <Input
              label={
                <div className="flex items-center gap-2">
                  <HashIcon size={16} className="text-gray-500" />
                  <span>Starting Ticket ID</span>
                </div>
              }
              type="number"
              placeholder="e.g., 1000"
              value={manualTicketId}
              onChange={(e) => setManualTicketId(e.target.value)}
              min="1"
              icon={<HashIcon size={18} className="text-gray-400" />}
            />

            {localStorage.getItem('manualTicketId') && (
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-start gap-3">
                <CheckCircle size={20} className="text-green-600 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-sm font-semibold text-green-900 mb-1">
                    Manual Ticket ID is Active
                  </p>
                  <p className="text-sm text-green-800 flex items-center gap-1">
                    <HashIcon size={14} />
                    Current setting: Ticket ID #{localStorage.getItem('manualTicketId')}
                  </p>
                  <p className="text-xs text-green-700 mt-1">
                    New tickets will start from #{parseInt(localStorage.getItem('manualTicketId')) + 1}
                  </p>
                </div>
              </div>
            )}

            <div className="flex gap-2 justify-end pt-2">
              {localStorage.getItem('manualTicketId') && (
                <Button
                  variant="outline"
                  onClick={handleClearTicketId}
                  className="flex items-center gap-2"
                >
                  <XCircle size={16} />
                  Clear Setting
                </Button>
              )}
              <Button
                onClick={handleSetTicketId}
                className="flex items-center gap-2"
              >
                <Edit3 size={16} />
                Set Ticket ID
              </Button>
            </div>
          </div>
        </Modal>
      )}

      {/* Upgrade Modal */}
      <Modal
        isOpen={showUpgradeModal}
        onClose={() => setShowUpgradeModal(false)}
        title="Upgrade to Pro Required"
      >
        <div className="space-y-4">
          <div className="flex items-start gap-3 p-4 bg-primary-50 border border-primary-200 rounded-lg">
            <Lock size={20} className="text-primary-600 mt-0.5 flex-shrink-0" />
            <div>
              <p className="text-sm font-semibold text-primary-900 mb-1">
                This feature requires a Pro upgrade
              </p>
              <p className="text-sm text-primary-700">
                Upgrade to Pro to unlock this feature and many more premium capabilities.
              </p>
            </div>
          </div>
          
          <div className="flex gap-2 justify-end pt-2">
            <Button
              variant="outline"
              onClick={() => setShowUpgradeModal(false)}
            >
              Cancel
            </Button>
            <Button
              onClick={() => {
                setShowUpgradeModal(false)
                navigate('/upgrade')
              }}
            >
              Upgrade to Pro
            </Button>
          </div>
        </div>
      </Modal>
    </>
  )
}
