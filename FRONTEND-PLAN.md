# Frontend Plan

## Stack & Conventions
- React 19 + Inertia.js 3 + TypeScript 5.7 + Tailwind CSS 4 + Radix UI + Lucide icons
- Pages: `resources/js/pages/` — each page is an Inertia page component
- Layouts resolved by path prefix in `app.tsx`:
  - `welcome` → no layout
  - `auth/*` → `AuthLayout` (centered card)
  - `settings/*` → `AppLayout + SettingsLayout` (sidebar + settings tabs)
  - `onboarding/*` → `AuthLayout` (centered card, forced flow)
  - `oauth/*`, `consent/*` → `CenteredLayout` (standalone, no sidebar)
  - everything else → `AppLayout` (sidebar)
- Forms use Inertia `<Form>` with Wayfinder route helpers (`import { store } from '@/routes/...'`)
- Static `.layout` property on page components for breadcrumb/title config
- Types auto-generated from PHP models in `resources/js/types/generated.ts`
- Toast notifications via `<Toaster>` (sonner)
- `ConfirmDialog` via Radix Dialog for all destructive actions
- All API calls from authenticated pages use Inertia forms or `router.get/post/put/delete`
- Status badges use a consistent color mapping across the app

---

## Layouts Needed

| Layout | Path Prefix | Description |
|--------|-------------|-------------|
| (none) | `welcome` | Full-page landing, no chrome |
| `AuthLayout` | `auth/*` | Centered card with title/description (exists) |
| `AppLayout + SettingsLayout` | `settings/*` | Sidebar + settings sub-tabs (exists) |
| `AppLayout` | `dashboard`, `apps/*`, `consents/*`, `data-hub/*`, `compliance/*`, `social-accounts/*`, `developer/*`, `admin/*` | Main app sidebar |
| `CenteredLayout` | `oauth/*`, `consent/verify/*` | Standalone narrow card, no sidebar, no nav — for OAuth consent and parental consent response |
| `AuthLayout` | `onboarding/*` | Centered card for forced onboarding flow |

`CenteredLayout` is new — a minimal layout with only the app logo and a centered content area, used for OAuth and parental consent screens that must not show the app sidebar.

---

## Sidebar Navigation (`components/app-sidebar.tsx`)

Expand `mainNavItems` from just "Dashboard" to grouped sections:

```
Platform
  Dashboard

Apps
  My Apps

Data
  My Consents
  Data Hub

Compliance
  My Profile

Settings
  (links to /settings/* — existing sidebar tabs)
```

For admin users (`auth.user.roles` includes `admin` or `super_admin`), add:

```
Admin
  Dashboard
  Users
  Apps
  Audit Logs
  Data Requests
  Countries
  Webhooks
```

---

## Pages

### 1. Unauthenticated Pages (already built)

These pages exist and are complete. Listed here for completeness.

#### 1.1 Welcome / Landing
- **File:** `pages/welcome.tsx` ✅
- **Layout:** none
- **Props:** (shared only)
- **Content:** Hero, login/register links

#### 1.2 Login
- **File:** `pages/auth/login.tsx` ✅
- **Layout:** AuthLayout
- **Props:** `{ status?: string, canResetPassword: boolean }`
- **Content:** Passkey button, email/password form, remember me, forgot password link, register link

#### 1.3 Register
- **File:** `pages/auth/register.tsx` ✅
- **Layout:** AuthLayout
- **Props:** `{ passwordRules: string }`
- **Content:** Name, email, password, confirm password form, login link

#### 1.4 Forgot Password
- **File:** `pages/auth/forgot-password.tsx` ✅
- **Layout:** AuthLayout
- **Props:** `{ status?: string }`

#### 1.5 Reset Password
- **File:** `pages/auth/reset-password.tsx` ✅
- **Layout:** AuthLayout
- **Props:** `{ token: string, email: string, passwordRules: string }`

#### 1.6 Two-Factor Challenge
- **File:** `pages/auth/two-factor-challenge.tsx` ✅
- **Layout:** AuthLayout
- **Content:** OTP input or recovery code input

#### 1.7 Confirm Password
- **File:** `pages/auth/confirm-password.tsx` ✅
- **Layout:** AuthLayout
- **Content:** Passkey or password confirmation

#### 1.8 Verify Email
- **File:** `pages/auth/verify-email.tsx` ✅
- **Layout:** AuthLayout
- **Props:** `{ status?: string }`

---

### 2. Onboarding (NEW — forced flow after registration)

The `EnsureOnboardingComplete` middleware blocks all authenticated requests if the user's profile is incomplete. After login, if `onboarding_status !== 'completed'`, the user must be redirected to the onboarding page.

#### 2.1 Onboarding
- **File:** `pages/onboarding/index.tsx` 🆕
- **Route:** `/onboarding`
- **Layout:** AuthLayout
- **Props:** `{ countries: Country[], onboarding_status: string, profile?: UserProfile, required_fields: string[], optional_fields: string[] }`
- **API:** `POST /api/onboarding`
- **Content:**
  - Step indicator (step 1 of 2 or 1 of 1)
  - Country selector (dropdown populated from `GET /api/compliance/countries`)
  - State/province input
  - City input (optional)
  - Date of birth input
  - Submit button
  - On success: redirects to dashboard (or parental consent if required)
- **Components:** `CountrySelect`, `OnboardingForm`

#### 2.2 Parental Consent Required (interstitial)
- **File:** `pages/onboarding/parental-consent.tsx` 🆕
- **Route:** `/onboarding/parental-consent`
- **Layout:** AuthLayout
- **Props:** `{ parental_consent_status: string, parent_email?: string }`
- **API:** `POST /api/compliance/parental-consent/request`
- **Content:**
  - Explanation: "Because you are under [age], parental consent is required"
  - Form: parent email (required), parent name (optional)
  - Submit sends consent request email
  - Status display: pending, granted, denied
  - If pending: "A consent email has been sent to [email]. Please wait for your parent to respond."
- **Components:** `ParentalConsentForm`, `ConsentStatusBadge`

---

### 3. Dashboard

#### 3.1 Dashboard
- **File:** `pages/dashboard.tsx` (exists, needs full implementation)
- **Layout:** AppLayout
- **Props:** `{ stats: { total_apps, total_consents, active_sessions, recent_events } }`
- **API:** (new endpoint or computed from existing)
- **Content:**
  - Welcome header with user name
  - Stat cards: My Apps count, Active Consents, Active Sessions
  - Quick actions: Register new app, View consents, Manage data
  - Compliance status banner (if profile incomplete or parental consent pending)
  - Recent activity feed (last 10 audit events for current user)
- **Components:** `StatCard`, `ComplianceBanner`, `ActivityFeed`

---

### 4. Settings (existing section, needs expansion)

Settings uses a sub-navigation sidebar with tabs. Currently has Profile, Security, Appearance. Needs additional tabs.

#### 4.1 Profile ✅
- **File:** `pages/settings/profile.tsx` ✅
- **Content:** Name/email edit, email verification resend, delete account

#### 4.2 Security ✅ (needs new sections)
- **File:** `pages/settings/security.tsx` ✅ (exists, needs additions)
- **Additional sections needed:**

  **4.2.1 Active Sessions** (new section)
  - **API:** `GET /api/sessions`, `DELETE /api/sessions/{id}`, `DELETE /api/sessions`
  - **Content:**
    - List of active sessions: device name, IP, last used, created
    - Current session highlighted
    - "Revoke" button per session
    - "Revoke all other sessions" button
  - **Components:** `SessionCard`, `ConfirmDialog` (for revoke all)

  **4.2.2 Trusted Devices** (new section)
  - **API:** `GET /api/settings/devices`, `POST /api/settings/devices/trust`, `DELETE /api/settings/devices/{device}`
  - **Content:**
    - List of trusted devices: device name, IP, trusted date, last used
    - "Trust current device" button
    - "Remove" button per device
  - **Components:** `DeviceCard`

#### 4.3 Appearance ✅
- **File:** `pages/settings/appearance.tsx` ✅

#### 4.4 Connected Accounts 🆕 (new tab)
- **File:** `pages/settings/connected-accounts.tsx` 🆕
- **Route:** `/settings/connected-accounts`
- **Layout:** AppLayout + SettingsLayout
- **Props:** `{ accounts: SocialAccount[] }`
- **API:** `GET /api/social/accounts`, `POST /api/social/link`, `DELETE /api/social/{provider}`
- **Content:**
  - List of supported providers: Google, Apple, GitHub, Microsoft, Facebook, Twitter
  - For each provider: linked status, avatar, email, linked date
  - If linked: "Unlink" button (with confirm dialog)
  - If not linked: "Link" button → opens provider OAuth flow
  - Warning: cannot unlink if it's the only auth method
- **Components:** `SocialProviderCard`, `ConfirmDialog`, `LinkProviderModal`

---

### 5. Apps (Developer — My OAuth Apps)

#### 5.1 Apps Overview
- **File:** `pages/apps/index.tsx` 🆕
- **Route:** `/apps`
- **Layout:** AppLayout
- **Props:** `{ apps: App[] }`
- **API:** `GET /api/apps`
- **Content:**
  - Heading "My Apps" with "Register new app" button
  - Grid/list of user's apps showing: icon, name, description, status badge, created date
  - Click on app card → navigates to app detail
  - Empty state if no apps
- **Components:** `AppCard`, `StatusBadge`, `EmptyState`

#### 5.2 Create App
- **File:** `pages/apps/create.tsx` 🆕
- **Route:** `/apps/create`
- **Layout:** AppLayout
- **API:** `POST /api/apps`
- **Content:**
  - Form sections:
    - App Info: name, description, icon URL, category
    - URLs: homepage URL, privacy policy URL, terms URL
    - Redirect URIs: dynamic list — add/remove URIs (min 1)
  - Submit creates app and redirects to app detail
  - On success: shows client ID and client secret (one-time display)
- **Components:** `AppForm`, `RedirectUriList`, `TokenDisplay` (for one-time secret reveal)

#### 5.3 App Detail (multi-tab page)
- **File:** `pages/apps/[id].tsx` 🆕
- **Route:** `/apps/{app}`
- **Layout:** AppLayout
- **Props:** `{ app: App }` (initial), then child routes load tab data
- **Content:** Tabbed interface with these tabs:

  **5.3.1 Overview Tab**
  - **API:** `GET /api/apps/{app}`
  - **Content:**
    - App icon, name, description, category
    - Status badge (pending, active, rejected, suspended)
    - Client ID (always visible, copyable)
    - Created date
    - Quick links to other tabs
  - **Components:** `StatusBadge`, `ClipboardButton`

  **5.3.2 Credentials Tab**
  - **API:** `GET /api/apps/{app}` (client_id visible), `POST /api/apps/{app}/regenerate-secret`
  - **Content:**
    - Client ID: always visible, copy button
    - Client Secret: hidden by default, "Reveal" button (one-time view after creation)
    - "Regenerate client secret" button with confirmation dialog (requires checkbox confirmation)
    - Warning: "Regenerating will invalidate the current secret. Update your app configuration immediately."
  - **Components:** `TokenDisplay`, `ClipboardButton`, `ConfirmDialog`

  **5.3.3 Settings Tab**
  - **API:** `PUT /api/apps/{app}`
  - **Content:** Same form fields as Create App but pre-filled. Editable fields:
    - Name, description, icon URL, category
    - Homepage URL, privacy policy URL, terms URL
    - Redirect URIs (add/remove)
  - **Components:** `AppForm`, `RedirectUriList`

  **5.3.4 Scopes Tab**
  - **API:** `GET /api/apps/{app}/scopes`
  - **Content:**
    - List of scopes defined for this app
    - Each scope: name, description, required/optional badge
    - "Add scope" button → inline form or modal
    - Edit/delete scope actions
  - **Components:** `ScopeList`, `ScopeBadge`, `ScopeForm`, `ConfirmDialog`

  **5.3.5 Consents Tab**
  - **API:** `GET /api/apps/{app}/consents`, `DELETE /api/apps/{app}/consents`
  - **Content:**
    - Paginated table of users who have consented
    - Each row: user name/email, scopes granted, consent method, granted date, status (active/revoked)
    - "Revoke all consents" button with confirmation
  - **Components:** `DataTable`, `ConsentRow`, `StatusBadge`, `ConfirmDialog`

  **5.3.6 Stats Tab**
  - **API:** `GET /api/apps/{app}/stats`
  - **Content:**
    - Total consents, active consents, revoked consents
    - Total scopes count
    - Created date, last consent date
    - Simple bar chart or card layout
  - **Components:** `StatCard`

  **5.3.7 Webhooks Tab**
  - **API:** Webhook endpoints are currently admin-only, but per-app webhooks would logically be here
  - **Content:**
    - List of webhook endpoints for this app
    - Each endpoint: URL, events, active status, last delivery, created date
    - "Add endpoint" button
    - Click endpoint → deliveries list
  - **Components:** `WebhookEndpointCard`, `WebhookDeliveryRow`, `ConfirmDialog`
  - **Note:** Depends on whether per-app webhooks are exposed to developers or kept admin-only

  **5.3.8 Danger Zone Tab**
  - **Content:**
    - Delete app (with confirmation)
    - (Suspend app if applicable)
  - **Components:** `ConfirmDialog`

---

### 6. Consents (User's perspective — what apps have I authorized?)

#### 6.1 My Consents
- **File:** `pages/consents/index.tsx` 🆕
- **Route:** `/consents`
- **Layout:** AppLayout
- **Props:** `{ consents: ConsentRecord[] }`
- **API:** `GET /api/consent/my`, `DELETE /api/consent/{record}`
- **Content:**
  - Heading "My Consents" with description
  - Paginated list of consent records
  - Each record: app icon + name, scopes list (as badges), consent method, granted date, status (active/revoked)
  - "Revoke" button per consent (with confirm dialog)
  - Filter: active only / all
- **Components:** `ConsentCard`, `ScopeBadge`, `StatusBadge`, `ConfirmDialog`, `DataTable`, `EmptyState`

---

### 7. Data Hub

#### 7.1 Data Hub Overview
- **File:** `pages/data-hub/index.tsx` 🆕
- **Route:** `/data-hub`
- **Layout:** AppLayout
- **API:** `GET /api/apps` (to list user's apps), `GET /api/data-hub/{app}/data`
- **Content:**
  - Heading "Data Hub" with description
  - App selector dropdown (list of user's active apps)
  - Once app selected: table of stored key-value pairs
  - Add new key-value pair (inline form)
  - Edit value inline or in modal
  - Delete key (with confirm)
  - Empty state if no data stored for this app
- **Components:** `AppSelector`, `DataKeyValueRow`, `DataKeyForm`, `ConfirmDialog`, `EmptyState`

#### 7.2 Sharing Agreements
- **File:** `pages/data-hub/agreements.tsx` 🆕
- **Route:** `/data-hub/agreements`
- **Layout:** AppLayout
- **Props:** `{ agreements: DataSharingAgreement[] }`
- **API:** `GET /api/data-hub/agreements`, `DELETE /api/data-hub/agreements/{id}`
- **Content:**
  - Heading "Sharing Agreements"
  - List of agreements: source app → target app, data keys shared, status (active/revoked), granted date
  - "Revoke" button per agreement (with confirm)
- **Components:** `SharingAgreementCard`, `ScopeBadge`, `StatusBadge`, `ConfirmDialog`, `EmptyState`

#### 7.3 Data Sharing Requests
- **File:** `pages/data-hub/requests.tsx` 🆕
- **Route:** `/data-hub/requests`
- **Layout:** AppLayout
- **API:** `GET /api/data-hub/agreements` (includes pending requests), `POST /api/data-hub/requests/{id}/grant`, `POST /api/data-hub/requests/{id}/deny`
- **Content:**
  - Heading "Data Sharing Requests"
  - List of pending incoming requests
  - Each request: requesting app name, target app name, data keys requested, date
  - "Grant" and "Deny" buttons
  - Empty state if no pending requests
- **Components:** `DataRequestCard`, `ScopeBadge`, `EmptyState`

#### 7.4 Token Exchange (developer feature)
- **File:** (part of app detail, or modal in data hub)
- **API:** `POST /api/data-hub/{app}/exchange-token`
- **Content:**
  - Exchange token form: select granting app, select scopes
  - Returns access token with expiration
  - Copy token button
- **Components:** `TokenDisplay`

---

### 8. Compliance

#### 8.1 Compliance Profile
- **File:** `pages/compliance/profile.tsx` 🆕
- **Route:** `/compliance/profile`
- **Layout:** AppLayout
- **Props:** `{ profile?: UserProfile, countries: Country[] }`
- **API:** `GET /api/compliance/profile`, `POST /api/compliance/profile`, `GET /api/compliance/countries`
- **Content:**
  - If profile exists: display current profile info
    - Date of birth (editable)
    - Country (editable, dropdown)
    - State/province (editable)
    - City (editable)
    - Age verification status (badge: verified/unverified)
    - Parental consent status (badge: not_required/pending/granted/denied)
  - If no profile: "Complete your profile" form with same fields
  - If parental consent required: link to request parental consent
  - Compliance status summary card at top
- **Components:** `CountrySelect`, `ComplianceStatusCard`, `StatusBadge`, `ConsentStatusBadge`

#### 8.2 Parental Consent Request
- **File:** `pages/compliance/parental-consent-request.tsx` 🆕 (or modal within profile page)
- **Route:** `/compliance/parental-consent-request`
- **Layout:** AppLayout
- **API:** `POST /api/compliance/parental-consent/request`
- **Content:**
  - Form: parent email (required), parent name (optional)
  - Submit button
  - If already requested: status display (pending/granted/denied)
  - Info text explaining parental consent process
- **Components:** `ParentalConsentForm`, `StatusBadge`

#### 8.3 Data Requests (GDPR)
- **File:** `pages/compliance/data-requests.tsx` 🆕
- **Route:** `/compliance/data-requests`
- **Layout:** AppLayout
- **Props:** `{ dataRequests: DataAccessRequest[] }`
- **API:** `GET /api/compliance/data-requests`, `POST /api/compliance/data-export`, `POST /api/compliance/data-deletion`, `GET /api/compliance/data-export/{id}/download`
- **Content:**
  - Heading "Data Requests" with description
  - Action buttons:
    - "Request Data Export" → triggers `POST /api/compliance/data-export` with confirm
    - "Request Data Deletion" → triggers `POST /api/compliance/data-deletion` with double-confirm (typing confirmation)
  - Table of past/current requests:
    - Type (export/deletion), status (pending/processing/completed), requested date, fulfilled date
    - For completed exports: "Download" button
  - Empty state if no requests
- **Components:** `DataRequestCard`, `StatusBadge`, `ConfirmDialog`, `DataTable`, `EmptyState`

#### 8.4 Parental Consent Response (standalone — from email link)
- **File:** `pages/compliance/parental-consent.tsx` 🆕
- **Route:** `/consent/verify/{token}`
- **Layout:** CenteredLayout (no sidebar)
- **API:** `POST /api/consent/verify/{token}`
- **Content:**
  - Shows child's name/email (from token context)
  - "Grant consent" and "Deny consent" buttons
  - Success/error messages
  - No navigation, no sidebar — standalone page
- **Components:** `ConsentActionButton`, `CenteredLayout`

---

### 9. Social Accounts

#### 9.1 Connected Accounts (in Settings)
Already covered in section 4.4. This is a settings tab, not a standalone page.

---

### 10. OAuth Authorization Consent Screen (standalone)

#### 10.1 OAuth Authorize
- **File:** `pages/oauth/authorize.tsx` 🆕
- **Route:** `/oauth/authorize`
- **Layout:** CenteredLayout (no sidebar)
- **Props:** `{ client: { name, icon_url, description, homepage_url, privacy_policy_url }, requested_scopes: string[], user: { id, name, email }, state, authorization_url }`
- **API:** `GET /api/oauth/authorize` (renders page data), `POST /api/oauth/authorize/consent`
- **Content:**
  - App icon and name
  - App description
  - "This app is requesting access to:" followed by list of scopes with descriptions
  - Scopes displayed with checkboxes (required scopes pre-checked and disabled)
  - "Privacy policy" and "Terms of service" links if available
  - "Allow" and "Deny" buttons
  - Small text: "You can revoke this consent at any time from your consents page"
- **Components:** `ScopeList`, `ScopeBadge`, `CenteredLayout`

---

### 11. Developer
(No separate developer section — API keys don't have API routes yet. When added, this would be a settings tab or a page under `/developer/api-keys`.)

#### 11.1 API Keys (future — no API routes yet)
- **File:** `pages/developer/api-keys.tsx` (placeholder only)
- **API:** Not yet implemented (`api_keys` table exists but no routes)
- **Content:**
  - List of API keys: name, scopes, created date, last used, expiration, status
  - "Create API Key" → form with name, scopes, expiration
  - Revoke button per key
  - One-time display of key value after creation
- **Components:** `TokenDisplay`, `DataTable`, `ConfirmDialog`

---

### 12. Admin Pages

Admin pages require `admin` or `super_admin` role. All API calls use `/api/admin/*`.

#### 12.1 Admin Dashboard
- **File:** `pages/admin/dashboard.tsx` 🆕
- **Route:** `/admin`
- **Layout:** AppLayout
- **API:** `GET /api/admin/analytics`
- **Content:**
  - Stat cards at top: total users, active users, suspended users, users last 24h
  - Second row: total apps, verified apps, pending apps
  - Third row: total consents, total audit events, pending data requests, logins last 24h
  - Charts: user registrations over time, consents over time
- **Components:** `StatCard`, `AreaChart` (or simple chart library)

#### 12.2 Users List
- **File:** `pages/admin/users/index.tsx` 🆕
- **Route:** `/admin/users`
- **Layout:** AppLayout
- **API:** `GET /api/admin/users?search=&status=&page=`
- **Content:**
  - Search bar (name/email)
  - Status filter dropdown (active, suspended, locked)
  - Paginated table: avatar, name, email, status badge, 2FA enabled, last login, created date, actions
  - Actions per user: view detail, suspend, unsuspend, unlock
  - Click row → user detail
- **Components:** `DataTable`, `StatusBadge`, `FilterBar`, `Pagination`, `EmptyState`

#### 12.3 User Detail (multi-section page)
- **File:** `pages/admin/users/[id].tsx` 🆕
- **Route:** `/admin/users/{user}`
- **Layout:** AppLayout
- **API:** `GET /api/admin/users/{user}`, `GET /api/admin/users/{user}/consents`, `GET /api/admin/users/{user}/social-accounts`, `GET /api/admin/users/{user}/data-requests`, `GET /api/admin/users/{user}/audit-logs`
- **Content:** Tabbed/sectioned user detail:

  **12.3.1 Profile Section**
  - Name, email, email verified, status badge, roles, created date, last login
  - Action buttons: Suspend, Unsuspend, Unlock, Impersonate (with confirm dialogs)
  - Impersonate: creates impersonation token, stores in localStorage, shows banner

  **12.3.2 Consents Section**
  - Table of consent records: app name, scopes, consent method, granted/revoked dates
  - Paginated

  **12.3.3 Social Accounts Section**
  - List of linked social accounts: provider, email, name, avatar, linked date
  - Token expiry status

  **12.3.4 Data Requests Section**
  - Table of data requests: type, status, requested date, fulfilled date
  - Actions: view details

  **12.3.5 Audit Logs Section**
  - Table of audit log entries: event type, event data (expandable), IP, user agent, timestamp
  - Paginated
  - Filter by event type

- **Components:** `UserDetailHeader`, `StatusBadge`, `DataTable`, `ConfirmDialog`, `ImpersonateBanner`

#### 12.4 App Review
- **File:** `pages/admin/apps/index.tsx` 🆕
- **Route:** `/admin/apps`
- **Layout:** AppLayout
- **API:** `GET /api/admin/apps?status=&category=&page=`
- **Content:**
  - Filter tabs: All, Pending, Active, Rejected, Suspended
  - Category filter dropdown
  - Paginated table: icon, name, owner, category, status badge, created date, verified date
  - Actions per app: View detail, Verify, Reject, Suspend
- **Components:** `DataTable`, `StatusBadge`, `FilterBar`, `Pagination`, `ConfirmDialog`

#### 12.5 App Review Detail
- **File:** `pages/admin/apps/[id].tsx` 🆕 (optional, or inline modal within list)
- **Route:** `/admin/apps/{app}`
- **Layout:** AppLayout
- **API:** `GET /api/admin/apps` (filtered) + `POST /api/admin/apps/{app}/verify`, `POST /api/admin/apps/{app}/reject`, `POST /api/admin/apps/{app}/suspend`
- **Content:**
  - Full app info: name, description, icon, owner, redirect URIs, homepage, privacy/terms URLs, category, status, created date, verified date
  - Client ID
  - Action buttons: Verify, Reject, Suspend (each with confirm dialog and optional reason)
- **Components:** `AppCard`, `StatusBadge`, `ConfirmDialog`

#### 12.6 Audit Logs
- **File:** `pages/admin/audit-logs.tsx` 🆕
- **Route:** `/admin/audit-logs`
- **Layout:** AppLayout
- **API:** `GET /api/admin/audit-logs?event_type=&user_id=&app_id=&from=&to=&page=`
- **Content:**
  - Filter bar: event type dropdown, user ID, app ID, date range (from/to)
  - Paginated table: event type, user (name/email link), app (name link), IP address, user agent, timestamp
  - Expandable row: full event_data JSON
- **Components:** `DataTable`, `FilterBar`, `Pagination`, `AuditLogRow`

#### 12.7 Data Requests Management
- **File:** `pages/admin/data-requests.tsx` 🆕
- **Route:** `/admin/data-requests`
- **Layout:** AppLayout
- **API:** `GET /api/admin/data-requests?status=&request_type=&page=`, `POST /api/admin/data-requests/{id}/fulfill`
- **Content:**
  - Filter tabs: All, Pending, Completed
  - Filter by type: Export, Deletion
  - Paginated table: user name/email, type (export/deletion), status, requested date, fulfilled date
  - Actions: Fulfill (for pending), View user
- **Components:** `DataTable`, `StatusBadge`, `FilterBar`, `Pagination`, `ConfirmDialog`

#### 12.8 Countries Configuration
- **File:** `pages/admin/countries.tsx` 🆕
- **Route:** `/admin/countries`
- **Layout:** AppLayout
- **API:** `GET /api/admin/countries`, `PUT /api/admin/countries/{code}`
- **Content:**
  - Table of all countries: name, code, age of digital consent, GDPR applicable, COPPA applicable, data retention days, parental consent age
  - Inline edit for each field (click to edit)
  - Search/filter by name
- **Components:** `DataTable`, `EditableCell`, `Pagination`

#### 12.9 Webhook Endpoints
- **File:** `pages/admin/webhooks/index.tsx` 🆕
- **Route:** `/admin/webhooks`
- **Layout:** AppLayout
- **API:** `GET /api/admin/webhooks?app_id=&is_active=&page=`, `POST /api/admin/webhooks`, `PUT /api/admin/webhooks/{id}`, `DELETE /api/admin/webhooks/{id}`, `POST /api/admin/webhooks/{id}/regenerate-secret`
- **Content:**
  - Filter by app, active status
  - Table of endpoints: URL, app name, events, active status, created date
  - "Create endpoint" button → form: app (dropdown), URL, events (multi-select), active toggle
  - Per endpoint: Edit, Delete, Regenerate Secret (with confirm), View Deliveries
- **Components:** `DataTable`, `WebhookEndpointForm`, `ConfirmDialog`, `TokenDisplay`, `FilterBar`, `Pagination`

#### 12.10 Webhook Endpoint Detail / Deliveries
- **File:** `pages/admin/webhooks/[id].tsx` 🆕
- **Route:** `/admin/webhooks/{endpoint}`
- **Layout:** AppLayout
- **API:** `GET /api/admin/webhooks/{id}`, `GET /api/admin/webhooks/{id}/deliveries`, `PUT /api/admin/webhooks/{id}`, `DELETE /api/admin/webhooks/{id}`, `POST /api/admin/webhooks/{id}/regenerate-secret`
- **Content:**
  - Endpoint details: URL, app, events, active, secret (reveal/hide), created/updated dates
  - Edit form (URL, events, active toggle)
  - Regenerate secret button (with confirm)
  - Delete endpoint button
  - Delivery log table: event type, status, response code, attempts, last attempt, created date
  - Expandable row: full payload, response body
- **Components:** `WebhookEndpointForm`, `WebhookDeliveryRow`, `TokenDisplay`, `ConfirmDialog`, `DataTable`

#### 12.11 Impersonation Banner (global component)
- **What:** A persistent banner shown when an admin is impersonating a user
- **API:** `GET /api/admin/impersonate/status` on app load
- **Content:**
  - "You are impersonating [user name]. [Stop impersonating]"
  - "Stop" button → `POST /api/admin/impersonate/stop`
- **Placement:** Top of page, fixed, above header
- **Components:** `ImpersonateBanner`

---

### 13. Impersonation (Admin Action)

Impersonation is triggered from admin user detail page (12.3):
- `POST /api/admin/users/{user}/impersonate` → returns impersonation token
- Frontend stores the token and user info
- `ImpersonateBanner` component shown globally
- `POST /api/admin/impersonate/stop` → stops impersonation, restores admin token

---

## Shared / Reusable Components

### UI Primitives (new, not yet existing)

| Component | File | Description |
|-----------|------|-------------|
| DataTable | `components/data-table.tsx` | Generic paginated, sortable, filterable table. Props: columns, data, pagination, onSort, onFilter. Built on Radix. |
| StatCard | `components/stat-card.tsx` | Card showing a metric: icon, label, value, optional trend/detail. |
| StatusBadge | `components/status-badge.tsx` | Colored badge mapping status strings to colors: pending=yellow, active=green, suspended=red, rejected=gray, verified=blue, etc. |
| EmptyState | `components/empty-state.tsx` | Placeholder for empty lists: icon, title, description, optional CTA button. |
| ConfirmDialog | `components/confirm-dialog.tsx` | Dialog with title, message, confirm/cancel buttons. Used for all destructive actions. Supports `variant="destructive"`. |
| ClipboardButton | `components/clipboard-button.tsx` | Button with copy-to-clipboard behavior and "Copied!" feedback. |
| FilterBar | `components/filter-bar.tsx` | Search input + dropdown filters (status, type, date range). Emits filter change events. |
| Pagination | `components/pagination.tsx` | Page number controls for paginated data. |
| SectionCard | `components/section-card.tsx` | Card with title, description, optional action button. For settings-like pages. |
| Tabs | `components/tabs.tsx` | Tab navigation component for multi-tab pages (app detail, admin user detail, etc.). |
| CenteredLayout | `layouts/centered-layout.tsx` | Layout with only logo + centered content area, no sidebar. For OAuth consent and parental consent. |

### Domain Components (new)

| Component | File | Description | Used In |
|-----------|------|-------------|---------|
| AppCard | `components/app-card.tsx` | Card: app icon, name, description, status badge, category | Apps overview, Admin apps |
| AppForm | `components/app-form.tsx` | Form fields for creating/editing apps: name, desc, icon, URLs, category | Create app, App settings tab |
| RedirectUriList | `components/redirect-uri-list.tsx` | Dynamic list of redirect URIs with add/remove | Create app, App settings tab |
| TokenDisplay | `components/token-display.tsx` | Displays a secret/token: masked by default, reveal toggle, copy button | Client secrets, API keys, webhook secrets |
| ScopeList | `components/scope-list.tsx` | List of OAuth scopes with descriptions and required/optional badges | OAuth authorize, App scopes tab |
| ScopeBadge | `components/scope-badge.tsx` | Small colored badge for a single scope name | Consent lists, scope lists |
| ScopeForm | `components/scope-form.tsx` | Add/edit scope: name, description, required toggle | App scopes tab |
| CountrySelect | `components/country-select.tsx` | Dropdown populated from `/api/compliance/countries` | Onboarding, Compliance profile |
| ComplianceStatusCard | `components/compliance-status-card.tsx` | Card showing age verification, parental consent, onboarding status | Dashboard, Compliance profile |
| DataKeyValueRow | `components/data-key-value-row.tsx` | Row: key, value (condensed JSON), edit button, delete button | Data hub |
| DataKeyForm | `components/data-key-form.tsx` | Form: key name, value (JSON editor), submit | Data hub |
| SharingAgreementCard | `components/sharing-agreement-card.tsx` | Card: source app → target app, data keys, status, revoke button | Sharing agreements |
| DataRequestCard | `components/data-request-card.tsx` | Card: requesting/target app, data keys, status, grant/deny buttons | Data requests |
| SessionCard | `components/session-card.tsx` | Card: device, IP, last used, created, revoke button | Settings > Security |
| DeviceCard | `components/device-card.tsx` | Card: device name, IP, trusted date, last used, remove button | Settings > Security |
| SocialProviderCard | `components/social-provider-card.tsx` | Card: provider icon, status (linked/unlinked), avatar/email, link/unlink button | Connected accounts |
| LinkProviderModal | `components/link-provider-modal.tsx` | Modal for initiating social provider OAuth flow | Connected accounts |
| ConsentCard | `components/consent-card.tsx` | Card: app icon/name, scopes, date, status, revoke | My consents |
| ConsentActionButton | `components/consent-action-button.tsx` | Grant/Deny buttons for consent flows | Parental consent response |
| AppSelector | `components/app-selector.tsx` | Dropdown to select one of user's apps | Data hub (app selector) |
| WebhookEndpointForm | `components/webhook-endpoint-form.tsx` | Form: app dropdown, URL, events multi-select, active toggle | Admin webhooks |
| WebhookDeliveryRow | `components/webhook-delivery-row.tsx` | Expandable row: event, status, response code, attempts, payload, response | Admin webhook detail |
| AuditLogRow | `components/audit-log-row.tsx` | Expandable row: event type, user, app, IP, timestamp, full event_data JSON | Admin audit logs |
| EditableCell | `components/editable-cell.tsx` | Click-to-edit table cell with inline input and save/cancel | Admin countries |
| ImpersonateBanner | `components/impersonate-banner.tsx` | Fixed top banner when impersonating, with stop button | Global (AppLayout) |
| UserDetailHeader | `components/user-detail-header.tsx` | User info header with avatar, name, email, status, roles, action buttons | Admin user detail |
| ParentalConsentForm | `components/parental-consent-form.tsx` | Form: parent email, parent name, submit | Onboarding parental consent |
| OnboardingForm | `components/onboarding-form.tsx` | Form: country, state, city, DOB | Onboarding |
| DataRequestCard | `components/data-request-card.tsx` | Card: request type, status, dates, download/fulfill actions | Compliance data requests |

### Existing Components (keep as-is)

| Component | File | Notes |
|-----------|------|-------|
| PasskeyVerify | `components/passkey-verify.tsx` | Used in login, confirm-password |
| PasskeyRegister | `components/passkey-register.tsx` | Used in manage-passkeys |
| PasskeyItem | `components/passkey-item.tsx` | Used in manage-passkeys |
| ManagePasskeys | `components/manage-passkeys.tsx` | Used in settings/security |
| ManageTwoFactor | `components/manage-two-factor.tsx` | Used in settings/security |
| TwoFactorSetupModal | `components/two-factor-setup-modal.tsx` | Used in manage-two-factor |
| TwoFactorRecoveryCodes | `components/two-factor-recovery-codes.tsx` | Used in manage-two-factor |
| DeleteUser | `components/delete-user.tsx` | Used in settings/profile |
| PasswordInput | `components/password-input.tsx` | Reused across auth forms |
| InputError | `components/input-error.tsx` | Reused across forms |
| Heading | `components/heading.tsx` | Page section headings |
| TextLink | `components/text-link.tsx` | Styled Inertia links |
| AppearanceTabs | `components/appearance-tabs.tsx` | Used in settings/appearance |
| AppSidebar | `components/app-sidebar.tsx` | Main sidebar (needs expansion) |
| AppHeader | `components/app-header.tsx` | Main header |
| AppShell | `components/app-shell.tsx` | Wrapper layout |
| AppContent | `components/app-content.tsx` | Content area |
| AppLogo | `components/app-logo.tsx` | Logo SVG |
| UserInfo | `components/user-info.tsx` | Avatar + name + email |
| UserMenuContent | `components/user-menu-content.tsx` | Dropdown menu |
| NavMain | `components/nav-main.tsx` | Sidebar navigation group |
| NavUser | `components/nav-user.tsx` | Sidebar user dropdown |
| NavFooter | `components/nav-footer.tsx` | Sidebar footer links |
| Breadcrumbs | `components/breadcrumbs.tsx` | Breadcrumb navigation |
| AlertError | `components/alert-error.tsx` | Error message display |

---

## Settings Sidebar Expansion

The settings sidebar (`layouts/settings/layout.tsx`) currently has:

```
Profile → /settings/profile
Security → /settings/security
Appearance → /settings/appearance
```

Needs to add:

```
Profile → /settings/profile
Security → /settings/security
Connected Accounts → /settings/connected-accounts    🆕
Appearance → /settings/appearance
```

The Security page needs two new sections:
- Active Sessions (after passkeys)
- Trusted Devices (after active sessions)

---

## Web Routes Needed (`routes/web.php` additions)

```php
// Onboarding (auth required, onboarding middleware redirects here)
Route::middleware(['auth'])->group(function () {
    Route::inertia('onboarding', 'onboarding/index')->name('onboarding');
    Route::inertia('onboarding/parental-consent', 'onboarding/parental-consent')->name('onboarding.parental-consent');
});

// Authenticated + verified pages
Route::middleware(['auth', 'verified'])->group(function () {
    // Apps
    Route::inertia('apps', 'apps/index')->name('apps.index');
    Route::inertia('apps/create', 'apps/create')->name('apps.create');
    Route::inertia('apps/{app}', 'apps/detail')->name('apps.show');

    // Consents
    Route::inertia('consents', 'consents/index')->name('consents.index');

    // Data Hub
    Route::inertia('data-hub', 'data-hub/index')->name('data-hub.index');
    Route::inertia('data-hub/agreements', 'data-hub/agreements')->name('data-hub.agreements');
    Route::inertia('data-hub/requests', 'data-hub/requests')->name('data-hub.requests');

    // Compliance
    Route::inertia('compliance/profile', 'compliance/profile')->name('compliance.profile');
    Route::inertia('compliance/parental-consent-request', 'compliance/parental-consent-request')->name('compliance.parental-consent-request');
    Route::inertia('compliance/data-requests', 'compliance/data-requests')->name('compliance.data-requests');

    // Settings (add new tab)
    Route::inertia('settings/connected-accounts', 'settings/connected-accounts')->name('settings.connected-accounts');

    // Developer
    Route::inertia('developer/api-keys', 'developer/api-keys')->name('developer.api-keys');

    // OAuth (may not need a web route — could be handled entirely by API redirect)
    Route::inertia('oauth/authorize', 'oauth/authorize')->name('oauth.authorize');
});

// Admin pages
Route::middleware(['auth', 'verified'])->prefix('admin')->group(function () {
    Route::inertia('', 'admin/dashboard')->name('admin.dashboard');
    Route::inertia('users', 'admin/users/index')->name('admin.users.index');
    Route::inertia('users/{user}', 'admin/users/detail')->name('admin.users.show');
    Route::inertia('apps', 'admin/apps/index')->name('admin.apps.index');
    Route::inertia('apps/{app}', 'admin/apps/detail')->name('admin.apps.show');
    Route::inertia('audit-logs', 'admin/audit-logs')->name('admin.audit-logs');
    Route::inertia('data-requests', 'admin/data-requests')->name('admin.data-requests');
    Route::inertia('countries', 'admin/countries')->name('admin.countries');
    Route::inertia('webhooks', 'admin/webhooks/index')->name('admin.webhooks.index');
    Route::inertia('webhooks/{endpoint}', 'admin/webhooks/detail')->name('admin.webhooks.show');
});

// Standalone (no sidebar)
Route::inertia('consent/verify/{token}', 'compliance/parental-consent-response')->name('consent.parental-response');
```

---

## Layout Resolution Update (`app.tsx`)

The layout resolver needs to handle new path prefixes:

```typescript
layout: (name) => {
    switch (true) {
        case name === 'welcome':
            return null;
        case name.startsWith('auth/'):
            return AuthLayout;
        case name.startsWith('onboarding/'):
            return AuthLayout;
        case name.startsWith('settings/'):
            return [AppLayout, SettingsLayout];
        case name.startsWith('oauth/'):
            return CenteredLayout;
        case name.startsWith('compliance/parental-consent-response'):
            return CenteredLayout;
        default:
            return AppLayout;
    }
}
```

---

## App.tsx Global Additions

- `ImpersonateBanner` should be rendered inside `withApp()` wrapper, checking impersonation status on mount
- Global toast handling for API errors (already handled by `<Toaster />`)

---

## Middleware Interception

The frontend needs to handle middleware blocks gracefully:

1. **`EnsureOnboardingComplete`** (403 response): When API returns `{ onboarding_status: "incomplete" }`, redirect to `/onboarding`
2. **`EnsureParentalConsent`** (403 response): When API returns parental consent required, redirect to `/onboarding/parental-consent`
3. **`CheckAccountStatus`** (403/429): Show suspended/locked message, redirect to appropriate page

These should be handled in an Inertia error handler or Axios interceptor.

---

## Implementation Priority

### Phase 1 — Core Infrastructure (blocks everything)
1. `CenteredLayout` — needed for OAuth consent and parental consent pages
2. `DataTable` — foundational for all list pages
3. `StatusBadge` — used everywhere
4. `ConfirmDialog` — used for all destructive actions
5. `ClipboardButton` — used for tokens, IDs, keys
6. `FilterBar` + `Pagination` — used for all admin/user list pages
7. `SectionCard` — used for settings sections
8. `Tabs` — used for app detail, admin user detail, admin webhook detail
9. `EmptyState` — used for all empty list states
10. `StatCard` — used for dashboard, admin dashboard, app stats
11. `ImpersonateBanner` — needed globally for admin impersonation
12. Expand `AppSidebar` navigation with all sections
13. Add `Connected Accounts` tab to settings sidebar
14. Middleware error interception (onboarding, parental consent, account status)

### Phase 2 — Essential User Pages
15. Onboarding page (critical — users get blocked without it)
16. Parental consent request page (critical for minors)
17. Expand Security page: Active Sessions + Trusted Devices sections
18. Connected Accounts settings tab
19. Dashboard (real stats)
20. My Consents page
21. Compliance Profile + Data Requests

### Phase 3 — App & Data Pages
22. Apps Overview page
23. Create App page
24. App Detail (all tabs: Overview, Credentials, Settings, Scopes, Consents, Stats, Danger Zone)
25. Data Hub Overview
26. Sharing Agreements
27. Data Sharing Requests

### Phase 4 — Standalone Auth Pages
28. OAuth Authorization Consent Screen
29. Parental Consent Response (standalone)

### Phase 5 — Admin Pages
30. Admin Dashboard (analytics)
31. Admin Users List
32. Admin User Detail (all sections)
33. Admin App Review
34. Admin App Detail
35. Admin Audit Logs
36. Admin Data Requests
37. Admin Countries Configuration
38. Admin Webhooks List
39. Admin Webhook Detail (with deliveries)

### Phase 6 — Developer & Future
40. API Keys (when backend routes are added)
41. Per-app webhooks in app detail (if exposed to developers)
42. Data hub token exchange UI

---

## Summary: Page Count

| Section | Pages |
|---------|-------|
| Auth (existing) | 7 |
| Onboarding (new) | 2 |
| Dashboard (rewrite) | 1 |
| Settings (additions) | 1 new tab + 2 new sections |
| Apps (new) | 3 (overview, create, detail with 8 tabs) |
| Consents (new) | 1 |
| Data Hub (new) | 3 |
| Compliance (new) | 3 |
| OAuth Consent (new) | 1 |
| Parental Consent Response (new) | 1 |
| Admin (new) | 9 |
| Developer (future) | 1 |
| **Total new pages** | **24** |
| **Total pages (including existing)** | **31** |

---

## Summary: Component Count

| Category | Count |
|----------|-------|
| UI Primitives (new) | 11 |
| Domain Components (new) | 28 |
| Layouts (new) | 1 |
| Existing Components | 28 |
| **Total new components** | **40** |