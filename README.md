# Auth System

A GDPR/COPPA-compliant identity provider with OAuth 2.1/OIDC, minor parental consent flows, verified app ecosystem, and cross-app data hub (RFC 8693 Token Exchange).

## Project Status

| Component | Status | Coverage |
|-----------|--------|----------|
| **Authentication** | Complete | Login, register, 2FA, passkeys, session management |
| **OAuth 2.1 / OIDC** | Complete | App management, consent, token exchange, discovery |
| **Social Login** | Complete | Google, Apple, GitHub, Microsoft, Facebook, Twitter |
| **Compliance** | Complete | Parental consent, data export, data deletion, country legislation |
| **Data Hub** | Complete | Cross-app data storage, sharing agreements, RFC 8693 token exchange |
| **Admin Panel** | Complete | User/app management, impersonation, audit logs, webhooks, analytics |
| **API Documentation** | Complete | Auto-generated OpenAPI 3.1.0 with interactive UI |
| **Tests** | 317 passing | Feature + Unit tests |
| **Frontend (React)** | Partial | Auth flows + settings complete. Dashboard and admin pages are placeholders |

## Requirements

- **PHP** >= 8.4
- **PostgreSQL** >= 15 (default: `auth` database)
- **Composer** >= 2.8
- **Bun** >= 1.0 (or npm/pnpm)
- **Node.js** >= 20
- PHP must have the `pdo_pgsql` and `pgsql` extensions enabled for local PostgreSQL access.

## Quick Start

```bash
# 1. Copy environment
cp .env.example .env

# 2. Install dependencies
composer install
bun install

# 3. Generate app key and create database
php artisan key:generate

# On Windows, `createdb` is only available if the PostgreSQL bin directory is on PATH.
# If it is not, create the database with pgAdmin or:
psql -U postgres -c "CREATE DATABASE auth;"

# 4. Run migrations and seed
php artisan migrate
php artisan db:seed

# 5. Generate Passport keys
php artisan passport:keys

# 6. Start development server
composer run dev
```

The app will be available at `http://localhost:8000`.

If `php artisan migrate` fails with `could not find driver`, enable the PostgreSQL PDO extension in the PHP installation that runs Artisan, then restart your terminal or PHP service before retrying.

### Default Admin Account

After seeding, an admin user is available:
- **Email:** `admin@example.com`
- **Password:** `password`
- **Role:** `super_admin`

## Development

### Running the App

```bash
# Full dev environment (server, queue, logs, Vite)
composer run dev

# Just the API server
php artisan serve

# Queue worker (required for webhooks, emails, data export/deletion)
php artisan queue:listen --tries=1
```

### Running Tests

```bash
# Full test suite
php artisan test

# With lint and type checks
composer run test

# Filter by test name
php artisan test --filter=LoginTest
```

### Code Quality

```bash
# PHP linting (Pint)
composer run lint

# PHP lint check
composer run lint:check

# ESLint
bun run lint

# TypeScript type check
bun run types:check

# Full CI check
composer run ci:check
```

## API Documentation

The API documentation is **auto-generated** from routes, controllers, FormRequests, and Resources using [Scramble](https://scramble.dedoc.co/).

### Interactive UI (Development)

| Endpoint | Description |
|----------|-------------|
| `GET /swagger` | Interactive documentation with Stoplight Elements (dark theme) |
| `GET /swagger.json` | OpenAPI specification in JSON |
| `GET /swagger.yaml` | OpenAPI specification in YAML |

### Export Commands

```bash
# Export swagger.yaml (updates the file in repo root)
php artisan swagger:export
bun run swagger

# Export swagger.json
php artisan swagger:export --format=json
bun run swagger:json
```

The OpenAPI spec is generated automatically from your code. To improve documentation:
- Add PHPDoc comments to controller methods
- Use FormRequest classes for request validation (auto-documented)
- Use API Resource classes for response schemas (auto-documented)

## TypeScript Types

TypeScript types are **auto-generated** from PHP Models and API Resources.

```bash
# Generate types
php artisan gen:types
bun run types
```

Output: `resources/js/types/generated.ts`

This file contains:
- **Model types** (e.g., `UserModel`, `AppModel`) with field types inferred from `$casts`
- **Resource types** (e.g., `User`, `App`, `ConsentRecord`) matching API response shapes

Regenerate types after adding/modifying models or resources.

## Architecture

### Backend (Laravel 13)

```
app/
├── Actions/Fortify/          # Fortify custom actions (registration, password reset)
├── Console/Commands/         # Artisan commands (gen:types, swagger:export)
├── Events/                   # Domain events (OAuth, Security, Compliance)
├── Http/
│   ├── Controllers/Api/      # API controllers (Auth, OAuth, Admin, etc.)
│   ├── Middleware/           # Auth, audit, security middleware
│   ├── Requests/             # FormRequest validation classes
│   └── Resources/            # API Resource transformers
├── Jobs/                     # Queue jobs (webhooks, data export, emails)
├── Listeners/                # Event listeners
├── Models/                   # Eloquent models (User, OAuth, Compliance, DataHub)
├── Notifications/            # Mail notifications
├── Policies/                 # Authorization policies
├── Services/                 # Business logic services
└── Providers/                # Service providers
```

### Frontend (React 19 + Inertia.js)

```
resources/js/
├── pages/                    # Inertia page components
├── components/               # Reusable React components
├── layouts/                  # Page layouts
├── hooks/                    # React hooks
├── types/                    # TypeScript types (generated.ts is auto-generated)
├── actions/                  # Wayfinder-generated route helpers
└── lib/                      # Utilities
```

## Key Features

### Authentication
- Email/password login with rate limiting and account lockout
- Two-factor authentication (TOTP) with recovery codes
- Passkey support (WebAuthn)
- Session management with device tracking
- Risk-based login assessment (impossible travel, new device, location)

### OAuth 2.1 / OIDC
- Authorization Code flow with PKCE (S256 only)
- Refresh token rotation
- OIDC Discovery endpoint (`/.well-known/openid-configuration`)
- App registration with admin review workflow
- Scope-based consent management

### Compliance (GDPR / COPPA)
- Country-specific age of digital consent legislation
- Parental consent flow with email verification
- Data export (GDPR right to portability)
- Data deletion (GDPR right to erasure) with audit trail preservation

### Data Hub (RFC 8693)
- Per-app key-value data storage for users
- Cross-app data sharing with user consent
- Token exchange for delegated data access
- Data sharing agreements with revocation

### Admin
- User management (suspend, unlock, impersonate)
- App review (verify, reject, suspend)
- Audit log viewer with filtering
- Webhook endpoint management
- Analytics dashboard
- Country legislation configuration

## Security

- Passwords hashed with bcrypt (12 rounds)
- Password policy: min 8 chars + letters + numbers + breached password check (dev), min 12 + mixed case + symbols (production)
- Account lockout after 5 failed attempts
- API key authentication with HMAC-hashed keys and revocation support
- Webhook URL validation blocks private/reserved IPs and SSRF
- Webhook signatures enforced as SHA-256 (algorithm downgrade prevented)
- Audit logs sanitize sensitive data and mask IP addresses
- Data deletion audit records store hashed emails only (GDPR compliant)
- CORS and CSRF protection via Laravel defaults

## Environment Variables

### Required

| Variable | Description |
|----------|-------------|
| `DB_*` | PostgreSQL connection settings |
| `PASSPORT_PRIVATE_KEY` | OAuth2 private key (generate with `php artisan passport:keys`) |
| `PASSPORT_PUBLIC_KEY` | OAuth2 public key |
| `PASSKEYS_USER_HANDLE_SECRET` | Random string for passkey user handles |

### Optional

| Variable | Description | Default |
|----------|-------------|---------|
| `AUTH_MAX_LOGIN_ATTEMPTS` | Max failed logins before lockout | `5` |
| `AUTH_LOCKOUT_DURATION` | Lockout duration in minutes | `60` |
| `AUTH_SESSION_LIFETIME_MINUTES` | Session lifetime | `480` |
| `SOCIALITE_*_CLIENT_ID` | Social provider credentials | (empty) |
| `IP_GEOLOCATION_SERVICE` | Geolocation provider (`ip-api` or `maxmind`) | `ip-api` |
| `MAXMIND_DATABASE_PATH` | Path to MaxMind GeoLite2 database | `storage/app/GeoLite2-City.mmdb` |

## Project Structure

```
├── app/                    # Laravel application code
├── bootstrap/              # Framework bootstrap files
├── config/                 # Configuration files
├── database/
│   ├── migrations/         # 33 database migrations
│   ├── seeders/            # Country, Role, Passport, Admin seeders
│   └── factories/          # Model factories for testing
├── resources/
│   ├── js/                 # React frontend
│   └── views/              # Blade templates (emails, Inertia root)
├── routes/
│   ├── api/                # API route files (auth, oauth, admin, etc.)
│   ├── web.php             # Web routes (Inertia pages)
│   └── settings.php        # Settings routes
├── tests/                  # 317 Pest tests (Feature + Unit)
├── swagger.yaml            # OpenAPI specification (auto-generated)
└── package.json            # Frontend dependencies and scripts
```

## Scripts Reference

| Command | Description |
|---------|-------------|
| `composer run dev` | Start full dev environment |
| `composer run test` | Run lint + tests |
| `php artisan test` | Run test suite |
| `bun run types` | Generate TypeScript types |
| `bun run swagger` | Export OpenAPI spec (YAML) |
| `bun run swagger:json` | Export OpenAPI spec (JSON) |
| `bun run lint` | Run ESLint |
| `bun run types:check` | TypeScript type check |

## License

MIT
