# Project Structure Guidelines

## Architecture Pattern
**Domain-Driven Laravel** — Organized by feature domain within each layer, not by type.

## Directory Structure

```
app/
├── Actions/                    # Single-responsibility business logic
│   ├── OAuth/                  # App registration, consent management
│   ├── Compliance/             # Parental consent, data export/deletion
│   ├── DataHub/                # Data storage, token exchange
│   └── Security/               # Login attempts, device trust
├── Concerns/                   # Reusable traits
├── Console/                    # Artisan commands
├── Events/                     # Domain events
│   ├── OAuth/
│   ├── Compliance/
│   ├── DataHub/
│   └── Security/
├── Exceptions/                 # Custom exceptions
│   ├── OAuth/
│   ├── Compliance/
│   └── Security/
├── Http/
│   ├── Controllers/
│   │   ├── Api/
│   │   │   ├── OAuth/          # App management, OIDC endpoints
│   │   │   ├── Compliance/     # Country info, parental consent, data requests
│   │   │   ├── DataHub/        # Data storage, sharing, token exchange
│   │   │   ├── Admin/          # Admin panel endpoints
│   │   │   ├── Auth/           # Login, register, 2FA, passkeys
│   │   │   └── Social/         # Social login, account linking
│   │   └── Controller.php      # Base controller
│   ├── Middleware/             # HTTP middleware
│   ├── Requests/               # Form request validation
│   │   ├── OAuth/
│   │   ├── Compliance/
│   │   ├── DataHub/
│   │   ├── Admin/
│   │   └── Auth/
│   └── Resources/              # API resource transformers
│       ├── OAuth/
│       ├── Compliance/
│       ├── DataHub/
│       └── Admin/
├── Jobs/                       # Queueable jobs
│   ├── DeliverWebhook.php
│   ├── ProcessDataDeletion.php
│   ├── SendParentalConsentEmail.php
│   └── ExpireOldData.php
├── Listeners/                  # Event listeners
│   ├── LogAuditEvent.php
│   ├── TriggerWebhooks.php
│   └── UpdateLoginMetrics.php
├── Models/                     # Eloquent models (already organized)
│   ├── OAuth/
│   ├── Compliance/
│   ├── DataHub/
│   ├── Admin/
│   └── User.php
├── Notifications/              # Laravel notifications
│   ├── ParentalConsentRequest.php
│   ├── ParentalConsentGranted.php
│   ├── DataExportReady.php
│   └── DataDeletionCompleted.php
├── Policies/                   # Authorization policies
│   ├── AppPolicy.php
│   ├── UserPolicy.php
│   ├── DataAccessRequestPolicy.php
│   └── DataSharingAgreementPolicy.php
├── Providers/                  # Service providers
└── Services/                   # Complex services (multi-action orchestration)
    ├── AuditService.php
    ├── ComplianceService.php
    ├── DataHubService.php
    ├── OAuthService.php
    ├── RiskAssessmentService.php
    └── WebhookService.php
```

## Naming Conventions

### Controllers
- Plural, resource-based: `AppsController`, `ConsentRecordsController`
- Single actions: `RequestParentalConsentController`, `ExchangeDataTokenController`
- Always under `Http/Controllers/Api/{Domain}/`

### Actions
- Verb-first, single responsibility: `RegisterApp`, `GrantParentalConsent`, `ExportUserData`
- One action per file
- Invokable: `public function __invoke(...)`

### Services
- Noun-based, orchestration: `ComplianceService`, `OAuthService`
- Coordinate multiple Actions
- No direct HTTP concerns

### Requests (Validation)
- Match controller action: `StoreAppRequest`, `UpdateAppRequest`, `GrantConsentRequest`

### Resources
- Singular model: `AppResource`, `UserResource`, `ConsentRecordResource`
- Collections: `AppResourceCollection` (auto-generated)

### Events
- Past tense, what happened: `AppRegistered`, `ConsentGranted`, `DataExportRequested`

### Jobs
- Verb-first, what it does: `DeliverWebhook`, `ProcessDataDeletion`

### Notifications
- Noun-based, what it is: `ParentalConsentRequest`, `DataExportReady`

### Policies
- Model name + Policy: `AppPolicy`, `UserPolicy`

### Exceptions
- Domain-specific: `AppSuspendedException`, `ConsentRequiredException`, `RateLimitExceededException`

## Code Standards

### Controllers
- Thin — delegate to Actions/Services
- Return API Resources or JSON responses
- Handle HTTP layer only (request → action → response)
- No business logic

### Actions
- Single public method: `__invoke()`
- Type-hint all parameters
- Return domain objects or primitives
- Throw domain exceptions on failure
- No HTTP concerns

### Services
- Coordinate Actions
- Inject via constructor
- Can contain complex business logic
- Return domain objects

### Models
- Relationships defined
- Accessors/mutators for computed values
- Business logic methods (e.g., `isMinor()`, `isLocked()`)
- No HTTP concerns
- Use casts for JSON/datetime

### Validation
- All validation in Form Request classes
- Use `authorize()` for policy checks
- Custom rules in `Rules/` directory if needed

### API Responses
- Consistent structure via API Resources
- Errors: `{ "message": "...", "errors": {...} }`
- Success: `{ "data": {...} }` or `{ "data": [...] }`
- Pagination: `{ "data": [...], "meta": {...}, "links": {...} }`

## Route Organization

```
routes/
├── api.php              # Main API routes (grouped by domain)
├── api/
│   ├── oauth.php        # OAuth/OIDC endpoints
│   ├── compliance.php   # GDPR/COPPA endpoints
│   ├── data-hub.php     # Data hub endpoints
│   ├── admin.php        # Admin panel endpoints
│   └── auth.php         # Auth endpoints (login, register, 2FA)
├── web.php              # Web routes (Inertia)
└── console.php          # Artisan commands
```

## Middleware Stack

```
api middleware group:
├── throttle:api
├── auth:sanctum (optional endpoints)
├── EnsureAppIsActive (OAuth endpoints)
├── AuditRequest (all endpoints)
└── CheckParentalConsent (protected endpoints)

admin middleware group:
├── auth:api
├── role:super_admin|moderator
└── audit:admin
```

## Error Handling

- Custom exceptions extend `App\Exceptions\BaseException`
- HTTP status codes mapped in `app/Exceptions/Handler.php`
- Validation errors: 422
- Auth errors: 401
- Permission errors: 403
- Not found: 404
- Business logic errors: 400/409/422

## Testing

```
tests/
├── Feature/
│   ├── OAuth/
│   ├── Compliance/
│   ├── DataHub/
│   ├── Admin/
│   └── Auth/
├── Unit/
│   ├── Actions/
│   ├── Models/
│   └── Services/
└── TestCase.php
```

- Feature tests for all API endpoints
- Unit tests for Actions and Services
- Use `RefreshDatabase` trait
- Factories for all models
