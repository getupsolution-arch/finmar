# FINMAR - Product Requirements Document

## Original Problem Statement
FINMAR is a modern Australian business combining Accounting Services, Digital Marketing, and AI-powered business tools into one integrated subscription platform. FINMAR provides a complete business support ecosystem for small and medium businesses seeking compliance + Sales and marketing growth + AI automation in one place.

## User Personas
1. **Small Business Owner** - Needs bookkeeping, BAS compliance, and basic marketing
2. **Growing Startup** - Requires comprehensive accounting + aggressive digital marketing
3. **Established SMB** - Wants full-service package with AI automation and CRM
4. **NDIS/Healthcare Provider** - Needs compliance-focused accounting with client management
5. **Platform Admin** - Manages users, subscriptions, contacts, and analytics

## Core Requirements (Static)
- Subscription-based platform with tiered pricing (AUD)
- Accounting packages: $250-$625/month
- Marketing packages: $149-$799/month  
- Combined packages: $399-$1,299/month
- AI-powered business insights dashboard
- Stripe payment integration
- JWT + Google OAuth authentication
- Admin portal for platform management

## Architecture
- **Frontend**: React 19 with Tailwind CSS, Framer Motion, shadcn/ui
- **Backend**: FastAPI with MongoDB
- **AI**: OpenAI GPT-5.2 via Emergent LLM Key
- **Payments**: Stripe via emergentintegrations library
- **Auth**: JWT (custom) + Google OAuth (Emergent Auth)

## What's Been Implemented (Feb 8, 2026)

### Backend API Endpoints - User Facing
- ✅ `/api/auth/register` - User registration with JWT
- ✅ `/api/auth/login` - User login with JWT
- ✅ `/api/auth/session` - Google OAuth session processing
- ✅ `/api/auth/me` - Get current user
- ✅ `/api/auth/logout` - User logout
- ✅ `/api/packages/*` - Pricing tiers endpoints
- ✅ `/api/subscriptions/my` - Get user subscription
- ✅ `/api/subscriptions/history` - Get subscription history
- ✅ `/api/subscriptions/change` - Upgrade/downgrade subscription
- ✅ `/api/subscriptions/cancel` - Cancel subscription
- ✅ `/api/payments/checkout` - Create Stripe checkout
- ✅ `/api/payments/status/{session_id}` - Check payment status
- ✅ `/api/profile` - Get/update user profile
- ✅ `/api/profile/change-password` - Change user password
- ✅ `/api/ai/insights` - AI business insights (GPT-5.2)
- ✅ `/api/contact` - Contact form submission

### Backend API Endpoints - Admin Portal
- ✅ `/api/admin/login` - Admin authentication
- ✅ `/api/admin/me` - Get admin info
- ✅ `/api/admin/dashboard/stats` - Dashboard statistics
- ✅ `/api/admin/users` - User management CRUD
- ✅ `/api/admin/subscriptions` - Subscription management
- ✅ `/api/admin/contacts` - Contact inquiries management
- ✅ `/api/admin/transactions` - Transaction history
- ✅ `/api/admin/revenue/chart` - Revenue analytics

### Frontend Pages - User Facing
- ✅ Homepage - Hero, stats, services overview, testimonials, CTA
- ✅ Services - Accounting, Marketing, AI tools sections
- ✅ Pricing - Interactive tier selection with Combined/Accounting/Marketing tabs
- ✅ Contact - Contact form with service interest dropdown
- ✅ Login - Email/password + Google OAuth
- ✅ Register - Full registration form + Google OAuth
- ✅ Dashboard - Subscription status, AI assistant, quick actions
- ✅ Profile - User profile editing, password change, subscription management
- ✅ Payment Success - Payment verification polling

### Frontend Pages - Admin Portal
- ✅ Admin Login - Secure admin authentication
- ✅ Admin Dashboard - Stats overview, revenue charts, subscription breakdown
- ✅ Admin Users - User list with search, edit, delete, role management
- ✅ Admin Subscriptions - Subscription list with status management
- ✅ Admin Contacts - Contact inquiry management with status workflow
- ✅ Admin Transactions - Payment transaction history

### Email Notifications (Resend)
- ✅ New user registration notification
- ✅ New subscription purchase notification
- ✅ Subscription cancellation notification  
- ✅ New contact inquiry notification
- ⚠️ Note: In test mode, emails only sent to verified addresses. Verify domain in Resend for production.

### Admin Credentials
- Email: sajeev@getupsolutions.com.au
- Password: Getup@4665

## Prioritized Backlog

### P0 (Critical) - Completed
- [x] User authentication (JWT + Google OAuth)
- [x] Subscription tiers display
- [x] Stripe payment integration
- [x] AI insights dashboard
- [x] Admin portal with full management features
- [x] User profile management
- [x] Subscription upgrade/downgrade/cancel flow
- [x] Email notifications for admin alerts

### P1 (High Priority) - Next Phase
- [ ] Billing history page with invoice downloads
- [ ] Password reset flow with email verification
- [ ] User-facing email notifications (payment receipts, welcome email)
- [ ] Domain verification for production emails

### P2 (Medium Priority)
- [ ] Service request/support tickets
- [ ] Document upload for accounting
- [ ] Marketing campaign reports
- [ ] Advanced AI analytics
- [ ] Export data functionality

### P3 (Nice to Have)
- [ ] Mobile app (PWA)
- [ ] Multi-user business accounts
- [ ] API access for integrations
- [ ] Custom reporting builder
- [ ] White-label options

## Next Tasks List
1. Verify domain in Resend for production email delivery
2. Add billing history with invoice PDF downloads
3. Implement password reset flow
4. Add user-facing email notifications (receipts, welcome)
5. Create service request/support ticket system
