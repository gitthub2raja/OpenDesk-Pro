import { useMemo } from 'react'
import { useAuth } from '../contexts/AuthContext'

/**
 * Feature to plan mapping
 * Features requiring PRO plan
 */
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
 * Custom hook to check feature access based on organization plan
 * @returns {Object} - { hasAccess, plan, isPro, isBasic }
 */
export const useFeatureAccess = () => {
  const { user } = useAuth()

  const plan = useMemo(() => {
    if (!user?.organization) return 'BASIC'
    
    // Handle both populated and non-populated organization
    const org = typeof user.organization === 'object' 
      ? user.organization 
      : null
    
    return org?.plan || 'BASIC'
  }, [user])

  const subscriptionExpiry = useMemo(() => {
    if (!user?.organization) return null
    
    const org = typeof user.organization === 'object' 
      ? user.organization 
      : null
    
    return org?.subscriptionExpiry ? new Date(org.subscriptionExpiry) : null
  }, [user])

  const isPro = useMemo(() => {
    if (plan !== 'PRO') return false
    
    // Check if subscription is expired
    if (subscriptionExpiry && new Date() > subscriptionExpiry) {
      return false
    }
    
    return true
  }, [plan, subscriptionExpiry])

  const isBasic = !isPro

  /**
   * Check if user has access to a specific feature
   * @param {string} featureName - Name of the feature
   * @returns {boolean} - True if user has access
   */
  const hasAccess = useMemo(() => {
    return (featureName) => {
      const requiredPlan = FEATURE_PLAN_REQUIREMENTS[featureName]
      
      // If feature doesn't require PRO, everyone has access
      if (!requiredPlan || requiredPlan !== 'PRO') {
        return true
      }

      // Feature requires PRO
      return isPro
    }
  }, [isPro])

  return {
    hasAccess,
    plan,
    isPro,
    isBasic,
    subscriptionExpiry,
  }
}

export default useFeatureAccess

