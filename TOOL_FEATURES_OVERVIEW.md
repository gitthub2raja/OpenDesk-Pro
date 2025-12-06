# Ticketing Tool - Complete Features Overview

## 📋 Table of Contents
1. [Project Overview](#project-overview)
2. [Architecture](#architecture)
3. [Core Features](#core-features)
4. [User Roles & Permissions](#user-roles--permissions)
5. [Email Integration](#email-integration)
6. [External Integrations](#external-integrations)
7. [Security Features](#security-features)
8. [Admin Features](#admin-features)
9. [Technical Stack](#technical-stack)
10. [Project Structure](#project-structure)

---

## 🎯 Project Overview

This is a **comprehensive enterprise ticketing system** built with modern web technologies. It provides a complete solution for managing support tickets, customer requests, and IT service management with advanced features like email integration, SLA management, automation, and external system integrations.

### Key Characteristics
- **Multi-tenant**: Supports multiple organizations
- **Role-based access control**: Granular permissions system
- **Email-driven**: Create tickets from emails automatically
- **SLA-aware**: Automatic SLA tracking and breach detection
- **Automated workflows**: Email automation and rule-based processing
- **Extensible**: API keys and webhook integrations

---

## 🏗️ Architecture

### Technology Stack

**Frontend:**
- React 18 with Vite
- Tailwind CSS for styling
- React Router for navigation
- React Three Fiber for 3D components
- Recharts for data visualization

**Backend:**
- Node.js with Express.js
- MongoDB with Mongoose ODM
- JWT for authentication
- Nodemailer for email sending
- IMAP for email receiving

**Infrastructure:**
- Docker Compose for containerization
- Nginx as reverse proxy
- MongoDB 7.0 database
- Multi-container architecture

### System Components

```
┌─────────────┐
│   Nginx     │ (Port 80/443) - Reverse Proxy
└──────┬──────┘
       │
       ├──────────────┬──────────────┐
       │              │              │
┌──────▼──────┐ ┌─────▼─────┐ ┌─────▼─────┐
│  Frontend   │ │  Backend  │ │  MongoDB  │
│  (React)    │ │ (Express) │ │  (7.0)    │
└─────────────┘ └───────────┘ └───────────┘
```

---

## ✨ Core Features

### 1. **Ticket Management**

#### Ticket Lifecycle
- **Statuses**: `open`, `approval-pending`, `approved`, `rejected`, `in-progress`, `resolved`, `closed`
- **Priorities**: `low`, `medium`, `high`, `urgent`
- **Auto-incrementing Ticket IDs**: Starting from 1000 (configurable)
- **Manual Ticket ID**: Admins can set custom ticket ID starting point

#### Ticket Features
- **Title & Description**: Rich text support
- **Categories**: Customizable ticket categories
- **Departments**: Department-based routing
- **Assignment**: Assign to technicians/admins
- **Comments**: Threaded comments with mentions
- **Attachments**: File uploads (up to 10 files per ticket)
- **Due Dates**: Automatic SLA-based due dates
- **Email Tracking**: Link tickets to source emails
- **Approval Workflow**: Department head approval system

#### Ticket Views
- **Dashboard**: Overview with statistics
- **Ticket List**: Filterable and searchable
- **Ticket Detail**: Full ticket view with comments
- **Search**: Advanced ticket search
- **Reports**: Analytics and reporting

### 2. **Dashboard & Analytics**

#### User Dashboard
- **Statistics Cards**: Total tickets, open tickets, resolved tickets
- **My Open Tickets**: Tickets assigned to or created by user
- **Recent Tickets**: Latest ticket activity
- **Charts**: Visual representation of ticket metrics
- **Role-specific Views**: Different dashboards for different roles

#### Admin Analytics
- **Ticket Metrics**: Volume, resolution times, trends
- **SLA Compliance**: Response and resolution time tracking
- **User Activity**: User engagement metrics
- **Department Performance**: Department-wise statistics
- **Custom Reports**: Generate and export reports

### 3. **Email Integration**

#### SMTP Configuration (Outgoing)
- **Authentication Methods**:
  - App Password (traditional)
  - OAuth2 (Microsoft 365, Gmail)
- **Features**:
  - Custom from email and name
  - Secure/TLS support
  - Port configuration
  - Test email functionality

#### IMAP Configuration (Incoming)
- **Authentication Methods**:
  - App Password (traditional)
  - OAuth2 (Microsoft 365, Gmail)
- **Features**:
  - Automatic email polling
  - Folder selection (default: INBOX)
  - Email-to-ticket conversion
  - Duplicate detection
  - Attachment handling

#### Email-to-Ticket Conversion
- **Automatic Parsing**: Extract ticket info from emails
- **Subject as Title**: Email subject becomes ticket title
- **Body as Description**: Email body becomes ticket description
- **Priority Detection**: Auto-detect priority from subject/body
- **Sender Tracking**: Link ticket to sender email
- **Acknowledgment Emails**: Auto-send confirmation emails

### 4. **Domain Rules (Whitelist/Blacklist)**

#### Domain Filtering
- **Whitelist**: Only accept emails from specified domains
- **Blacklist**: Reject emails from specified domains
- **Domain Normalization**: Automatic domain format handling
- **Multiple Domains**: Add/remove multiple domains
- **Rejection Emails**: Send rejection notifications
- **Enable/Disable Toggle**: Turn filtering on/off

#### Use Cases
- Control which external domains can create tickets
- Block spam or unwanted email sources
- Ensure only trusted domains create tickets
- Compliance and security requirements

### 5. **SLA (Service Level Agreement) Management**

#### SLA Policies
- **Priority-based**: Different SLAs for different priorities
- **Organization-specific**: Custom SLAs per organization
- **Global Policies**: Default SLAs for all organizations
- **Response Time**: Time to first response (in hours)
- **Resolution Time**: Time to ticket resolution (in hours)

#### SLA Tracking
- **Automatic Calculation**: Due dates based on SLA policies
- **Breach Detection**: Monitor SLA violations
- **Warning System**: Pre-breach notifications
- **Breach Notifications**: Alert when SLA is breached
- **Real-time Monitoring**: Continuous SLA tracking

#### SLA Worker
- Background process monitoring SLA compliance
- Automatic breach detection
- Warning email notifications
- Breach status updates

### 6. **Email Automation**

#### Automation Rules
- **Trigger Conditions**: Based on ticket status, priority, category
- **Actions**: Send emails, update tickets, assign tickets
- **Recipients**: Ticket creator, assignee, department head
- **Templates**: Use email templates for automation
- **Active/Inactive**: Enable/disable automation rules

#### Automation Scenarios
- Welcome email on ticket creation
- Status change notifications
- Assignment notifications
- SLA warning emails
- Resolution confirmations

### 7. **Email Templates**

#### Template Features
- **Variables**: Dynamic content insertion
- **HTML Support**: Rich email formatting
- **Categories**: Organize templates by purpose
- **Preview**: Test template rendering
- **Variables Available**:
  - `{{ticket.title}}`
  - `{{ticket.id}}`
  - `{{user.name}}`
  - `{{assignee.name}}`
  - And more...

### 8. **External Integrations**

#### Integration Types
1. **Webhook**: Receive data from external systems
2. **API**: Connect to external APIs
3. **Azure Sentinel**: Security alert integration
4. **Custom**: Custom integration types

#### Azure Sentinel Integration
- **Webhook Endpoint**: Unique URL for each integration
- **Field Mapping**: Map Sentinel fields to ticket fields
- **Automatic Ticket Creation**: Convert alerts to tickets
- **Workspace Configuration**: Azure workspace details
- **Trigger Tracking**: Monitor integration usage

#### Webhook Features
- **Unique URLs**: Auto-generated webhook endpoints
- **Authentication**: Bearer token, API key, Basic auth
- **Custom Headers**: Configure request headers
- **Field Mapping**: Map external data to ticket fields
- **Active/Inactive**: Enable/disable integrations

### 9. **API Keys Management**

#### API Key Features
- **Create API Keys**: Generate new API keys
- **Key Details**: Name, description, permissions
- **Activate/Revoke**: Control key status
- **Delete Keys**: Remove unused keys
- **Usage Tracking**: Monitor API key usage

### 10. **Chatbot & FAQ**

#### AI Chatbot
- **Ticket Creation**: Create tickets via chat
- **FAQ Answers**: Answer common questions
- **Context Awareness**: Understand conversation context
- **Chat History**: Store and review conversations
- **Admin Management**: Configure chatbot behavior

#### FAQ Management
- **Question/Answer Pairs**: Create FAQ entries
- **Categories**: Organize FAQs
- **Search**: Find relevant FAQs
- **Public/Private**: Control FAQ visibility

### 11. **Microsoft Teams Integration**

#### Teams Features
- **Ticket Notifications**: Send ticket updates to Teams
- **Channel Integration**: Post to Teams channels
- **Webhook Configuration**: Teams webhook setup
- **Rich Cards**: Formatted ticket information

### 12. **Backup & Restore**

#### Backup Features
- **Database Backup**: Full MongoDB backup
- **Scheduled Backups**: Automatic backup scheduling
- **Manual Backup**: On-demand backups
- **Restore**: Restore from backup files
- **Backup History**: Track backup operations

---

## 👥 User Roles & Permissions

### Role Hierarchy

1. **Admin**
   - Full system access
   - All configuration options
   - User management
   - System settings
   - Analytics and reports

2. **Department Head**
   - Approve/reject tickets
   - View department tickets
   - Department management
   - Department reports

3. **Technician** (formerly Agent)
   - Assign tickets
   - Update ticket status
   - Add comments
   - View assigned tickets
   - Access reports

4. **User**
   - Create tickets
   - View own tickets
   - Add comments to own tickets
   - Update own profile

### Permission System
- **Role-based**: Permissions tied to roles
- **Granular Control**: Fine-grained permissions
- **Custom Roles**: Create custom roles with specific permissions
- **Organization Isolation**: Users only see their organization's data

---

## 🔐 Security Features

### Authentication
- **JWT Tokens**: Secure token-based authentication
- **Password Hashing**: bcrypt password encryption
- **Session Management**: Secure session handling

### Multi-Factor Authentication (MFA)
- **TOTP Support**: Time-based one-time passwords
- **QR Code Setup**: Easy MFA configuration
- **Backup Codes**: Recovery codes for MFA
- **Optional/Required**: Configurable MFA requirement

### Single Sign-On (SSO)
- **SAML 2.0**: Enterprise SSO support
- **OAuth 2.0**: OAuth-based SSO
- **Azure AD**: Microsoft Entra ID integration
- **Google Workspace**: Google SSO support

### API Security
- **API Keys**: Secure API authentication
- **Bearer Tokens**: Token-based API access
- **Rate Limiting**: Prevent API abuse
- **CORS Configuration**: Cross-origin security

---

## ⚙️ Admin Features

### User Management
- **Create Users**: Add new users
- **Edit Users**: Update user information
- **Delete Users**: Remove users
- **Role Assignment**: Assign roles to users
- **Status Management**: Activate/deactivate users
- **Department Assignment**: Assign users to departments

### Organization Management
- **Multi-tenant**: Multiple organizations
- **Organization Settings**: Configure organization details
- **Isolation**: Data isolation between organizations

### Department Management
- **Create Departments**: Add new departments
- **Edit Departments**: Update department info
- **Delete Departments**: Remove departments
- **Department Head Assignment**: Assign department heads

### Category Management
- **Ticket Categories**: Organize tickets by category
- **Create/Edit/Delete**: Full category management
- **Category-based Routing**: Route tickets by category

### Role Management
- **Custom Roles**: Create custom roles
- **Permission Assignment**: Assign specific permissions
- **Role Editing**: Modify existing roles
- **Permission Granularity**: Fine-grained permissions

### Logo Management
- **Upload Logo**: Custom organization logo
- **Logo Display**: Show logo in UI
- **Logo Replacement**: Update logo

### Ticket Import
- **Bulk Import**: Import tickets from CSV/Excel
- **Data Mapping**: Map import fields
- **Validation**: Validate imported data

---

## 📧 Email Integration Details

### OAuth2 Flow
1. **Configuration**: Set client ID, secret, refresh token
2. **Token Refresh**: Automatic token refresh
3. **Access Token**: Use access token for authentication
4. **Expiration Handling**: Handle token expiration

### Email Workers
- **Email Receiver Worker**: Polls IMAP for new emails
- **Email Automation Worker**: Processes automation rules
- **SLA Worker**: Monitors SLA compliance

### Email Features
- **HTML Emails**: Rich email formatting
- **Email Templates**: Reusable email templates
- **Attachments**: Send email attachments
- **Reply-to**: Handle email replies

---

## 🔌 External Integrations Details

### Webhook Integration
- **Endpoint**: `/api/integrations/webhook/:webhookId`
- **Method**: POST
- **Payload**: JSON data
- **Field Mapping**: Map external fields to ticket fields
- **Authentication**: Bearer token, API key, Basic auth

### Azure Sentinel Integration
- **Alert Reception**: Receive security alerts
- **Automatic Tickets**: Convert alerts to tickets
- **Field Mapping**: Map Sentinel fields
- **Workspace Config**: Azure workspace details

### API Integration
- **REST API**: Connect to external REST APIs
- **Authentication**: Multiple auth methods
- **Custom Headers**: Configure request headers
- **Response Handling**: Process API responses

---

## 🛠️ Technical Stack

### Frontend Technologies
- **React 18**: UI library
- **Vite**: Build tool and dev server
- **Tailwind CSS**: Utility-first CSS
- **React Router**: Client-side routing
- **React Three Fiber**: 3D graphics
- **Recharts**: Data visualization
- **React Hot Toast**: Notifications
- **Lucide React**: Icons
- **date-fns**: Date utilities

### Backend Technologies
- **Node.js**: Runtime environment
- **Express.js**: Web framework
- **MongoDB**: NoSQL database
- **Mongoose**: ODM for MongoDB
- **JWT**: Authentication tokens
- **bcryptjs**: Password hashing
- **Nodemailer**: Email sending
- **IMAP**: Email receiving
- **Multer**: File uploads
- **Speakeasy**: MFA/TOTP

### Infrastructure
- **Docker**: Containerization
- **Docker Compose**: Multi-container orchestration
- **Nginx**: Reverse proxy and load balancer
- **MongoDB 7.0**: Database server

---

## 📁 Project Structure

```
ticketing_tool/
├── frontend/                 # React frontend application
│   ├── src/
│   │   ├── components/       # Reusable UI components
│   │   │   ├── layout/       # Layout components (Sidebar, TopBar)
│   │   │   └── ui/           # UI components (Button, Input, Modal)
│   │   ├── pages/            # Page components
│   │   │   ├── Admin/        # Admin pages
│   │   │   ├── Tickets/      # Ticket pages
│   │   │   └── SSO/          # SSO login pages
│   │   ├── contexts/         # React contexts (Auth, Theme, SSO)
│   │   ├── services/         # API services
│   │   └── utils/            # Utility functions
│   └── public/               # Static assets
│
├── server/                   # Node.js backend application
│   ├── models/              # Mongoose models
│   ├── routes/              # Express routes
│   ├── services/            # Business logic services
│   ├── middleware/          # Express middleware
│   ├── workers/             # Background workers
│   ├── scripts/             # Utility scripts
│   └── config/              # Configuration files
│
├── docker-compose.yml        # Docker Compose configuration
├── nginx-ssl.conf           # Nginx configuration
└── scripts/                 # Installation and setup scripts
```

### Key Directories

**Frontend (`frontend/src/`):**
- `pages/Admin/`: All admin management pages
- `pages/Tickets/`: Ticket-related pages
- `components/layout/`: Navigation and layout
- `services/api.js`: Centralized API calls
- `contexts/`: Global state management

**Backend (`server/`):**
- `models/`: Database schemas (User, Ticket, EmailSettings, etc.)
- `routes/`: API endpoints (auth, tickets, admin, etc.)
- `services/`: Business logic (emailService, emailReceiver, chatbot, etc.)
- `workers/`: Background processes (emailWorker, slaWorker, etc.)
- `middleware/`: Authentication and authorization

---

## 🚀 Key Workflows

### Ticket Creation Workflow
1. User creates ticket (web form or email)
2. System assigns ticket ID (auto-increment or manual)
3. SLA policy applied based on priority
4. Due dates calculated
5. Email acknowledgment sent
6. Ticket appears in dashboard

### Email-to-Ticket Workflow
1. Email received via IMAP
2. Domain rules checked (whitelist/blacklist)
3. Email parsed for ticket information
4. Duplicate detection (by message ID)
5. Ticket created automatically
6. Acknowledgment email sent
7. Ticket appears in system

### SLA Monitoring Workflow
1. Ticket created with SLA policy
2. Response and resolution due dates set
3. SLA worker monitors continuously
4. Warning sent before breach
5. Breach detected and logged
6. Breach notification sent
7. Ticket marked as breached

### External Integration Workflow
1. External system sends webhook/API request
2. Integration validates request
3. Field mapping applied
4. Ticket created from external data
5. Confirmation sent to external system
6. Integration usage tracked

---

## 📊 Database Models

### Core Models
- **User**: User accounts and authentication
- **Ticket**: Ticket data and lifecycle
- **Organization**: Multi-tenant organizations
- **Department**: Department structure
- **Category**: Ticket categories
- **Role**: User roles and permissions
- **SLAPolicy**: SLA configuration
- **EmailSettings**: Email configuration
- **EmailTemplate**: Email templates
- **EmailAutomation**: Automation rules
- **ExternalIntegration**: External system integrations
- **ApiKey**: API authentication keys
- **FAQ**: Frequently asked questions
- **ChatSession**: Chatbot conversations
- **Logo**: Organization logos

---

## 🔄 Background Workers

### Email Worker
- Polls IMAP for new emails
- Processes incoming emails
- Creates tickets from emails
- Sends acknowledgment emails

### SLA Worker
- Monitors ticket SLA compliance
- Detects SLA breaches
- Sends warning notifications
- Updates breach status

### Email Automation Worker
- Processes automation rules
- Triggers email actions
- Executes automation workflows
- Tracks automation execution

---

## 🎨 UI/UX Features

### Design System
- **Modern UI**: Clean, professional design
- **Responsive**: Mobile-first approach
- **Dark/Light Theme**: Theme toggle support
- **3D Components**: Interactive 3D elements
- **Animations**: Smooth transitions
- **Toast Notifications**: User feedback

### Navigation
- **Sidebar**: Collapsible navigation
- **Top Bar**: User info and actions
- **Breadcrumbs**: Navigation context
- **Search**: Global search functionality

---

## 📝 Configuration Files

### Environment Variables
- `MONGODB_URI`: Database connection string
- `JWT_SECRET`: JWT token secret
- `FRONTEND_URL`: Frontend application URL
- `PORT`: Backend server port
- `NODE_ENV`: Environment (development/production)

### Docker Configuration
- `docker-compose.yml`: Service orchestration
- `nginx-ssl.conf`: Nginx reverse proxy config
- `Dockerfile`: Container build instructions

---

## 🔍 Monitoring & Logging

### Health Checks
- Backend health endpoint: `/api/health`
- MongoDB health check
- Nginx health check
- Container health status

### Logging
- Console logging for debugging
- Error logging
- API request logging
- Worker process logging

---

## 📚 Additional Resources

### Installation
- See `INSTALLATION.md` for setup instructions
- See `installation_files/` for deployment guides

### Integration Guides
- See `INTEGRATIONS_GUIDE.md` for integration details

### API Documentation
- API endpoints documented in route files
- API key authentication required for external access

---

## 🎯 Use Cases

### IT Service Management
- Help desk ticketing
- Incident management
- Service request management
- Change management

### Customer Support
- Customer ticket management
- Support team coordination
- SLA compliance tracking
- Customer communication

### Enterprise
- Multi-organization support
- Department-based routing
- Approval workflows
- Compliance tracking

---

## 🔮 Future Enhancements (Potential)

- Asset management integration
- Knowledge base system
- Advanced reporting and analytics
- Mobile app support
- Real-time notifications (WebSocket)
- Advanced automation (workflow builder)
- Multi-language support
- Advanced search and filtering
- Ticket templates
- Time tracking

---

## 📞 Support & Maintenance

### Maintenance Tasks
- Regular database backups
- Log rotation
- Security updates
- Performance monitoring
- SLA policy review

### Troubleshooting
- Check Docker container status
- Review application logs
- Verify database connectivity
- Check email configuration
- Review API endpoint responses

---

**Last Updated**: December 2025
**Version**: 1.0.0
**License**: (Check project license file)

