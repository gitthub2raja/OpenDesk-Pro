# Freemium Business Model Implementation

## Overview

This document describes the implementation of a Freemium business model with **Basic** (default) and **Pro** tiers for the Ticketing Tool.

## Implementation Summary

### 1. Database Schema Updates

**File:** `server/models/Organization.js`

Added the following fields to the Organization model:
- `plan`: String enum ['BASIC', 'PRO'], default: 'BASIC'
- `subscriptionExpiry`: Date, default: null
- `paymentReference`: String (for transaction IDs)
- `paymentStatus`: String enum ['PENDING', 'VERIFIED', 'FAILED'], default: 'VERIFIED'
- `paymentScreenshot`: String (path to uploaded screenshot)

**Default State:** All new organizations are created with `plan: 'BASIC'` and `paymentStatus: 'VERIFIED'`.

### 2. Feature Gating Middleware

**File:** `server/middleware/checkFeature.js`

Created middleware to check feature access based on organization plan:
- `checkFeature(featureName)`: Middleware factory function
- `hasFeatureAccess(organization, featureName)`: Helper function

**Features Requiring PRO:**
- `SLA_MANAGER` - SLA Policies management
- `SSO_INTEGRATION` - Single Sign-On configuration
- `EXTERNAL_INTEGRATIONS` - External API/webhook integrations
- `ADVANCED_REPORTS` - Advanced reporting and analytics
- `EMAIL_AUTOMATION` - Email automation workflows
- `TEAMS_INTEGRATION` - Microsoft Teams integration
- `AZURE_SENTINEL` - Azure Sentinel integration
- `DOMAIN_RULES` - Domain whitelist/blacklist
- `CUSTOM_ROLES` - Custom role creation

**Applied to Routes:**
- `/api/admin/sla/*` - SLA routes
- `/api/admin/sso/*` - SSO routes
- `/api/integrations/*` - Integration routes
- `/api/reports/dashboard` - Advanced reports
- `/api/email-automation/*` - Email automation routes
- `/api/teams/*` - Teams integration routes
- Domain rules in email settings PUT route
- Custom roles POST route
- Azure Sentinel integration creation

### 3. Frontend Feature Access Hook

**File:** `frontend/src/hooks/useFeatureAccess.js`

Custom React hook that:
- Reads organization plan from AuthContext
- Checks subscription expiry
- Returns `hasAccess(featureName)` function
- Provides `plan`, `isPro`, `isBasic` flags

### 4. Payment & Upgrade System

**Backend Routes:** `server/routes/payment.js`

- `POST /api/payment/submit-request`: Submit upgrade request with transaction ID and optional screenshot
- `POST /api/payment/admin/approve-upgrade`: Admin-only endpoint to approve upgrades
- `GET /api/payment/status`: Get current organization payment status
- `GET /api/payment/admin/pending-upgrades`: Get all pending upgrade requests (admin only)

**Frontend Page:** `frontend/src/pages/Upgrade/UpgradePlan.jsx`

- Comparison table showing Basic vs Pro features
- Payment form with:
  - Transaction ID input (required)
  - Payment screenshot upload (optional)
  - QR code placeholder and UPI ID display
- Success message for Pro users

### 5. UI Updates

**Sidebar:** `frontend/src/components/layout/Sidebar.jsx`

- Lock icons (🔒) on PRO-only menu items for Basic users
- Upgrade modal when clicking locked features
- Feature mapping for admin menu items

**Admin Pages with Feature Gating:**
- `SSOConfig.jsx` - Shows upgrade prompt if Basic
- `EmailAutomation.jsx` - Shows upgrade prompt if Basic
- `DomainRules.jsx` - Shows upgrade prompt if Basic
- `Roles.jsx` - Prevents custom role creation if Basic

### 6. Basic Plan Restrictions

**Enforced Limits for BASIC Users:**

1. **SLA Management:** Disabled
2. **SSO Integration:** Disabled (Email/Password only)
3. **External Integrations:** Disabled
4. **Advanced Reports:** Disabled
5. **Email Automation:** Disabled
6. **Domain Rules:** Disabled (No whitelist/blacklist)
7. **Custom Roles:** Disabled (Only default roles: User, Technician, Admin)
8. **Teams Integration:** Disabled
9. **Azure Sentinel:** Disabled

**Allowed for BASIC Users:**
- Ticket Management
- Email Integration (SMTP/IMAP)
- User & Department Management
- Basic Reports
- API Keys
- Email Templates
- FAQ Management
- Chatbot

### 7. Payment Workflow

1. **User Submits Upgrade Request:**
   - Navigates to `/upgrade`
   - Fills transaction ID and optional screenshot
   - Submits via `POST /api/payment/submit-request`
   - Organization `paymentStatus` set to 'PENDING'

2. **Admin Notification:**
   - Email sent to all admin users
   - Includes organization name, transaction ID, and screenshot link

3. **Admin Approves Upgrade:**
   - Admin navigates to pending upgrades (future admin panel feature)
   - Calls `POST /api/payment/admin/approve-upgrade`
   - Organization updated:
     - `plan`: 'PRO'
     - `paymentStatus`: 'VERIFIED'
     - `subscriptionExpiry`: +1 year (configurable)

4. **User Notification:**
   - Email sent to organization admin confirming upgrade
   - Lists all Pro features now available

### 8. Default Behavior

**On Fresh Installation:**
- All organizations default to `plan: 'BASIC'`
- `paymentStatus: 'VERIFIED'` (Basic is free)
- All PRO features are gated and show upgrade prompts
- No PRO features accessible without manual database update or upgrade approval

**Migration Note:**
Existing organizations will default to BASIC plan. To upgrade existing organizations:
1. Update database: `db.organizations.updateMany({}, { $set: { plan: 'PRO' } })`
2. Or use the upgrade workflow through the UI

## API Endpoints

### Payment Endpoints

```
POST /api/payment/submit-request
Body: {
  transactionId: string (required)
  screenshot: File (optional)
}

POST /api/payment/admin/approve-upgrade
Body: {
  organizationId: string (required)
  subscriptionMonths: number (default: 12)
}

GET /api/payment/status
Returns: {
  plan: 'BASIC' | 'PRO',
  paymentStatus: 'PENDING' | 'VERIFIED' | 'FAILED',
  subscriptionExpiry: Date | null,
  paymentReference: string | null
}

GET /api/payment/admin/pending-upgrades
Returns: Array of organizations with pending upgrade requests
```

## Frontend Routes

```
/upgrade - Upgrade plan page with payment form
```

## Testing Checklist

- [ ] New organization defaults to BASIC
- [ ] PRO features show lock icons in sidebar
- [ ] Clicking locked features shows upgrade modal
- [ ] Upgrade page displays correctly
- [ ] Payment submission works
- [ ] Admin can approve upgrades
- [ ] Email notifications sent correctly
- [ ] Feature gating works on all protected routes
- [ ] Basic users cannot access PRO features
- [ ] Pro users can access all features
- [ ] Subscription expiry checked correctly

## Future Enhancements

1. **Admin Panel for Upgrades:**
   - List pending upgrade requests
   - Approve/reject from UI
   - View payment screenshots

2. **Automatic Payment Processing:**
   - Integrate payment gateway (Razorpay, Stripe)
   - Automatic subscription renewal
   - Payment webhook handling

3. **Subscription Management:**
   - Renew subscription
   - Cancel subscription
   - Downgrade from Pro to Basic

4. **Usage Analytics:**
   - Track feature usage by plan
   - Show upgrade prompts based on usage

5. **Trial Period:**
   - Free trial for Pro features
   - Automatic downgrade after trial

## Notes

- All PRO features are strictly gated at both backend and frontend
- Default state ensures BASIC-only access on fresh installs
- Payment workflow is manual (admin approval required)
- Email notifications require SMTP to be configured
- Payment screenshots stored in `server/uploads/payments/`

## Files Modified/Created

### Backend
- `server/models/Organization.js` - Added plan fields
- `server/middleware/checkFeature.js` - Feature gating middleware
- `server/routes/payment.js` - Payment routes (new)
- `server/routes/admin.js` - Added feature gating
- `server/routes/integrations.js` - Added feature gating
- `server/routes/emailAutomation.js` - Added feature gating
- `server/routes/reports.js` - Added feature gating
- `server/routes/teams.js` - Added feature gating
- `server/server.js` - Added payment routes

### Frontend
- `frontend/src/hooks/useFeatureAccess.js` - Feature access hook (new)
- `frontend/src/pages/Upgrade/UpgradePlan.jsx` - Upgrade page (new)
- `frontend/src/components/layout/Sidebar.jsx` - Lock icons and upgrade modal
- `frontend/src/pages/Admin/SSOConfig.jsx` - Feature gating
- `frontend/src/pages/Admin/EmailAutomation.jsx` - Feature gating
- `frontend/src/pages/Admin/DomainRules.jsx` - Feature gating
- `frontend/src/pages/Admin/Roles.jsx` - Feature gating
- `frontend/src/contexts/AuthContext.jsx` - Organization plan fetching
- `frontend/src/services/api.js` - Payment API methods
- `frontend/src/App.jsx` - Added upgrade route

---

**Implementation Date:** December 2025
**Version:** 1.0.0

