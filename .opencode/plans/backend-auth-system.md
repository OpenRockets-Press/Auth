# Auth System - Implementation Plan

## Overview
A GDPR/COPPA-compliant identity provider with OAuth 2.1/OIDC, minor parental consent flows, verified app ecosystem, and cross-app data hub (RFC 8693 Token Exchange). Built on Laravel 13 + PostgreSQL.

---

## Phase 1: OAuth 2.1/OIDC Server + App Management

### Migrations
1. `create_apps_table` — Registered OAuth applications (extends Passport clients)
2. `create_app_scopes_table` — Custom scope definitions per app
3. `create_consent_records_table` — User consent grants per app/scope
4. Passport migrations (via `php artisan passport:install`)

### Models
- `App` — OAuth client application
- `AppScope` — Scope definition
- `ConsentRecord` — User consent tracking

### Key Features
- App registration with `client_id`/`client_secret`
- Redirect URI management (JSON array)
- App verification workflow: `pending` → `verified` / `rejected` / `suspended`
- System apps flag (first-party, pre-verified)
- PKCE enforcement (OAuth 2.1 requirement)
- OIDC discovery endpoint (`/.well-known/openid-configuration`)
- Consent screen with scope granularity
- Consent revocation

### API Endpoints
- `POST /api/apps` — Register new app
- `GET /api/apps/{id}` — Get app details
- `PUT /api/apps/{id}` — Update app (owner only)
- `POST /api/apps/{id}/regenerate-secret` — Rotate client secret
- `GET /api/apps/{id}/consents` — List user consents for app
- `DELETE /api/apps/{id}/consents` — Revoke all consents

---

## Phase 2: Minor Compliance + Audit Logging

### Migrations
5. `create_countries_table` — Country legislation data
6. `create_user_profiles_table` — DOB, country, age verification
7. `create_parental_consents_table` — Parent consent records
8. `create_data_retention_policies_table` — Per-country retention rules
9. `create_data_access_requests_table` — Export/deletion requests
10. `create_audit_logs_table` — Immutable security event log

### Models
- `Country` — ISO code, age of consent, GDPR/COPPA flags
- `UserProfile` — Links to User, stores DOB, country
- `ParentalConsent` — Parent identity, consent status, method
- `DataRetentionPolicy` — Country-specific rules
- `DataAccessRequest` — User/parent data requests
- `AuditLog` — Security event logging

### Key Features
- Age check on registration via DOB
- Country-specific age of digital consent lookup
- Parental consent flow:
  - Parent email verification
  - Consent method: email confirmation, payment verification, gov ID
  - Consent grant/denial tracking
- Automatic data handling based on legislation:
  - GDPR: right to erasure, data portability, consent withdrawal
  - COPPA: verifiable parental consent, data minimization
- Data export (JSON machine-readable)
- Data deletion (soft → hard delete with retention period)
- Audit log: append-only, covers all security events

### API Endpoints
- `GET /api/compliance/country/{code}` — Get country legislation info
- `POST /api/compliance/parental-consent/request` — Request parental consent
- `POST /api/compliance/parental-consent/{id}/respond` — Parent responds
- `POST /api/compliance/data-export` — Request data export
- `POST /api/compliance/data-deletion` — Request data deletion
- `GET /api/compliance/data-requests` — List user's data requests
- `GET /api/audit-logs` — List audit logs (user + admin)

---

## Phase 3: Social Login + Data Hub

### Migrations
11. `create_social_accounts_table` — Linked social accounts
12. `create_user_data_stores_table` — Cross-app data storage
13. `create_data_sharing_agreements_table` — User consent for data sharing
14. `create_data_access_tokens_table` — Token exchange tokens
15. `create_data_requests_table` — Cross-app data requests

### Models
- `SocialAccount` — Provider link (Google, Apple, GitHub, etc.)
- `UserDataStore` — App-stored data about a user
- `DataSharingAgreement` — User consents to data sharing
- `DataAccessToken` — RFC 8693 exchanged tokens
- `DataRequest` — App-to-app data request

### Key Features
- Social login via Laravel Socialite (Google, Apple, GitHub, Microsoft, Facebook, X)
- Account linking/unlinking with conflict resolution
- Data Hub flow:
  1. App A stores data about user via `POST /api/data-hub/store`
  2. App B requests access via `POST /api/data-hub/request`
  3. User prompted for consent (extended OIDC screen)
  4. On approval, App B receives scoped data access token
  5. App B uses token to `GET /api/data-hub/access/{userId}`
- All data access audited
- Token exchange per RFC 8693

### API Endpoints
- `GET /api/social/{provider}/redirect` — Social auth redirect
- `GET /api/social/{provider}/callback` — Social auth callback
- `POST /api/social/link` — Link social account
- `DELETE /api/social/{provider}` — Unlink social account
- `POST /api/data-hub/store` — Store user data (app)
- `GET /api/data-hub/store/{key}` — Get stored data (app)
- `DELETE /api/data-hub/store/{key}` — Delete stored data (app)
- `POST /api/data-hub/request` — Request data from another app
- `POST /api/data-hub/token/exchange` — RFC 8693 token exchange
- `GET /api/data-hub/access/{userId}` — Access shared data (with token)

---

## Phase 4: Admin Panel + Security Hardening

### Migrations
16. `create_roles_table` — RBAC roles
17. `create_role_user_table` — User-role assignments
18. `create_trusted_devices_table` — Device trust management
19. `create_api_keys_table` — Server-to-server API keys
20. `create_webhook_endpoints_table` — App webhook configurations
21. `create_webhook_deliveries_table` — Webhook delivery tracking

### Models
- `Role` — Admin roles (super_admin, moderator, reviewer)
- `TrustedDevice` — Device fingerprint, trust status
- `ApiKey` — Server-to-server authentication
- `WebhookEndpoint` — App webhook URLs
- `WebhookDelivery` — Delivery status tracking

### Key Features
- Admin panel API (`/api/admin/*`):
  - User management (view, suspend, delete, impersonate)
  - App review queue (verify, reject, suspend)
  - Audit log viewer with filters
  - Consent management
  - Data request handling
  - System configuration (country rules, default scopes)
  - Analytics (logins, registrations, consents, data requests)
- Risk-based authentication:
  - IP reputation scoring
  - Geo-velocity detection (impossible travel)
  - Device fingerprinting
- Session management:
  - List active sessions
  - Remote logout
  - Session expiry policies
- Webhook system:
  - Notify apps of events (login, consent, data deletion)
  - Retry with exponential backoff
  - Signature verification (HMAC-SHA256)
- API key management:
  - Scoped keys for server-to-server
  - Rotation and revocation
- Brute force protection:
  - Progressive delays
  - Account lockout after N failures
  - IP-based rate limiting

### Admin API Endpoints
- `GET /api/admin/users` — List users
- `GET /api/admin/users/{id}` — User detail
- `POST /api/admin/users/{id}/suspend` — Suspend user
- `POST /api/admin/users/{id}/unsuspend` — Unsuspend user
- `POST /api/admin/users/{id}/impersonate` — Impersonate user
- `GET /api/admin/apps` — List apps (with filters)
- `POST /api/admin/apps/{id}/verify` — Verify app
- `POST /api/admin/apps/{id}/reject` — Reject app
- `POST /api/admin/apps/{id}/suspend` — Suspend app
- `GET /api/admin/audit-logs` — System-wide audit logs
- `GET /api/admin/data-requests` — All data requests
- `POST /api/admin/data-requests/{id}/fulfill` — Fulfill request
- `GET /api/admin/analytics` — Dashboard data
- `GET /api/admin/countries` — Manage country rules
- `PUT /api/admin/countries/{code}` — Update country rules

---

## Database Schema

### Core Tables (existing + modified)
- `users` — Add: `status`, `last_login_at`, `login_method`, `failed_login_attempts`, `locked_until`
- `passkeys` — Existing via Fortify
- `sessions` — Existing, extended

### Phase 1 Tables
- `apps` — id, owner_id, client_id (FK to oauth_clients), name, description, icon_url, status, is_system, redirect_uris (json), homepage_url, privacy_policy_url, terms_url, category, verified_at, suspended_at, created_at, updated_at
- `app_scopes` — id, app_id, name, description, is_required, created_at, updated_at
- `consent_records` — id, user_id, app_id, scopes (json), consent_method, ip_address, user_agent, granted_at, revoked_at, created_at, updated_at

### Phase 2 Tables
- `countries` — id, code, name, age_of_digital_consent, gdpr_applicable, coppa_applicable, data_retention_days, requires_parental_consent_below_age, created_at, updated_at
- `user_profiles` — id, user_id, date_of_birth, country_code, age_verified, age_verification_method, parental_consent_required, parental_consent_status, created_at, updated_at
- `parental_consents` — id, user_id, parent_email, parent_name, consent_method, consent_status, verification_token, verified_at, granted_at, revoked_at, ip_address, created_at, updated_at
- `data_retention_policies` — id, country_code, data_type, retention_days, auto_delete, created_at, updated_at
- `data_access_requests` — id, user_id, request_type (export|deletion), status, requested_by (user|parent), fulfilled_at, data_export_path, created_at, updated_at
- `audit_logs` — id, user_id, app_id, event_type, event_data (json), ip_address, user_agent, created_at

### Phase 3 Tables
- `social_accounts` — id, user_id, provider, provider_id, access_token, refresh_token, token_expires_at, avatar_url, email, name, linked_at, created_at, updated_at
- `user_data_stores` — id, user_id, app_id, key, value (json), created_at, updated_at
- `data_sharing_agreements` — id, user_id, source_app_id, target_app_id, data_keys (json), consent_status, granted_at, revoked_at, created_at, updated_at
- `data_access_tokens` — id, user_id, requesting_app_id, granting_app_id, scopes (json), token, expires_at, created_at
- `data_requests` — id, user_id, requesting_app_id, target_app_id, data_keys (json), status, user_consent_status, created_at, updated_at

### Phase 4 Tables
- `roles` — id, name, description, permissions (json), created_at, updated_at
- `role_user` — id, role_id, user_id, created_at
- `trusted_devices` — id, user_id, device_fingerprint, device_name, ip_address, user_agent, trusted_at, last_used_at, created_at, updated_at
- `api_keys` — id, user_id, app_id, name, key_hash, scopes (json), expires_at, last_used_at, created_at, updated_at
- `webhook_endpoints` — id, app_id, url, secret, events (json), is_active, created_at, updated_at
- `webhook_deliveries` — id, webhook_endpoint_id, event_type, payload (json), status, attempts, last_attempt_at, response_code, response_body, created_at, updated_at

---

## Security Considerations

- All tokens use cryptographically secure random generation
- Client secrets hashed with bcrypt
- Audit logs are append-only (no update/delete)
- Data exports encrypted at rest
- Webhook payloads signed with HMAC-SHA256
- Rate limiting on all auth endpoints
- PKCE required for all OAuth flows
- No implicit or password grants (OAuth 2.1)
- Session fixation protection
- CSRF protection on all state-changing endpoints
- SQL injection prevention via Eloquent parameterized queries
- XSS prevention via output escaping
- Password hashing with bcrypt (configurable rounds)
