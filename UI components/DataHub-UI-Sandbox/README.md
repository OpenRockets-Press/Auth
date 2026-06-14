# DataHub UI Sandbox: Comprehensive Implementation & Backend Integration Guide

## 1. Executive Summary

This document serves as the exhaustive, definitive architectural manual for the **DataHub UI Sandbox**. Unlike the singular features found in the Compliance and OAuth sandboxes, the DataHub represents the core nervous system of the entire platform. 

It encompasses three massive, distinct portals unified under a single Global App Switcher:
1. 👤 **The Personal Account Dashboard** (Home)
2. 💻 **The Developer Portal**
3. 🛡️ **The Admin Console**

This guide details the current state of these decoupled React interfaces and provides a granular, phase-by-phase blueprint for migrating this massive Single Page Application (SPA) into the native Laravel **Inertia.js** ecosystem.

---

## 2. Current UI Implementation & Component Architecture

The `DataHub-UI-Sandbox` is a robust React application powered by Vite, utilizing `react-router-dom` for client-side routing. It currently relies on hardcoded mocked data and `setTimeout` delays to simulate complex backend interactions.

### 2.1 The Global Shell
- **`App.tsx`**: The routing brain, defining paths for `/`, `/apps`, `/developer/*`, and `/admin/*`.
- **`AppLayout.tsx`**: The persistent outer shell. It houses the **Global Portal Switcher** (the header dropdown) allowing users to teleport between the Personal, Developer, and Admin contexts seamlessly.

### 2.2 Portal 1: Personal Account Dashboard
- **`HomeDashboard.tsx`**: The entry point, rendering cards for Linked Apps, Data Agreements, and Portals.
- **`ConnectedAppsScreen.tsx`**: Displays third-party apps the user has authorized. Mocks revoking access (`POST /api/data-hub/revoke`).
- **`DataAgreementsScreen.tsx`**: Lists active compliance consents.
- **`SettingsScreen.tsx`**: Simulates profile updates.

### 2.3 Portal 2: Developer Portal
Governed by `DeveloperLayout.tsx` with its own persistent sidebar.
- **`DeveloperOverviewScreen.tsx`**: Metrics and quick actions.
- **`DeveloperAppsScreen.tsx`**: Lists registered OAuth clients.
- **`CreateAppScreen.tsx`**: Mocks the creation of new OAuth clients (`POST /api/oauth/clients`).
- **`AppDashboardScreen.tsx`**: The control center for a specific app (Client ID, generating secrets).
- **`ApiKeysScreen.tsx` & `ApiDocsScreen.tsx`**: Developer resources (API Keys are currently marked as "Feature Locked" due to backend limitations).

### 2.4 Portal 3: Admin Console
Governed by `AdminLayout.tsx`.
- **`AdminOverviewScreen.tsx`**: Global platform metrics.
- **`UserManagementScreen.tsx`**: Mocks fetching paginated users (`GET /api/admin/users`) and banning accounts.
- **`AppModerationScreen.tsx`**: Mocks suspending or approving third-party OAuth apps (`POST /api/admin/apps/{id}/status`).
- **`ComplianceScreen.tsx`**: Mocks fulfilling GDPR data requests (`POST /api/admin/data-requests/{id}/process`).

---

## 3. Backend Architecture Analysis & Route Mapping

The Laravel `Auth` repository possesses a vast API routing layer perfectly tailored for these portals. However, they are currently stateless APIs.

### 3.1 Personal Account Mapping (`routes/api/data-hub.php` & `settings.php`)
| React Component | Backend API Route | HTTP | Controller Action |
|-----------------|-------------------|------|-------------------|
| `ConnectedAppsScreen` | `/api/data-hub/connected-apps` | GET | `DataHubController@connectedApps` |
| Revoke Access Action | `/api/data-hub/revoke` | POST | `DataHubController@revokeAccess` |
| `SettingsScreen` | `/api/settings/profile` | POST | `ProfileController@update` |

### 3.2 Developer Portal Mapping (`routes/api/oauth.php`)
| React Component | Backend API Route | HTTP | Controller Action |
|-----------------|-------------------|------|-------------------|
| `DeveloperAppsScreen` | `/api/oauth/clients` | GET | `ClientController@forUser` |
| `CreateAppScreen` | `/api/oauth/clients` | POST | `ClientController@store` |
| Generate Secret Action | `/api/oauth/clients/{id}/secret` | POST | `AppController@regenerateSecret` |

### 3.3 Admin Console Mapping (`routes/api/admin.php`)
| React Component | Backend API Route | HTTP | Controller Action |
|-----------------|-------------------|------|-------------------|
| `UserManagementScreen`| `/api/admin/users` | GET | `AdminController@users` |
| Ban User Action | `/api/admin/users/{id}/status` | POST | `AdminController@updateUserStatus` |
| `AppModerationScreen` | `/api/admin/apps` | GET | `AdminController@apps` |
| `ComplianceScreen` | `/api/admin/data-requests` | GET | `AdminController@dataRequests` |

---

## 4. Gap Analysis & Integration Strategy

### 4.1 The Inertia.js Paradigm Shift
We must abandon `react-router-dom` completely. Inertia.js relies on Laravel's router (`routes/web.php`) to dictate page transitions. 
Instead of `useEffect` fetching JSON arrays for "Connected Apps" or "Users", Laravel will query the database in the controller and pass the raw Collections to the React views as Inertia `props`.

### 4.2 Persistent Layouts
Because the DataHub relies heavily on `AppLayout` (for the Global Header) and nested layouts (`AdminLayout`, `DeveloperLayout`), we must utilize **Inertia Persistent Layouts**. 
This ensures the sidebar and header do not unmount and remount during page navigation, preserving scroll state and avoiding UI flicker.

---

## 5. Phase-by-Phase Integration Guide

### Phase 1: Controller Restructuring
We must create stateful Web Controllers that return Inertia renders.

```php
// app/Http/Controllers/Web/AdminWebController.php
namespace App\Http\Controllers\Web;

use Inertia\Inertia;
use App\Models\User;

class AdminWebController extends Controller {
    public function users() {
        // Fetch paginated users
        $users = User::paginate(20);
        return Inertia::render('admin/UserManagementScreen', [
            'users' => $users
        ]);
    }
}
```

### Phase 2: Route Registration (`routes/web.php`)
Register the new Inertia routes, ensuring they are protected by the correct middleware (`auth`, and role-based middleware like `is_admin`).

```php
Route::middleware(['auth', 'verified'])->group(function () {
    // Personal Account
    Route::get('/', [HomeWebController::class, 'dashboard'])->name('home');
    Route::get('/apps', [HomeWebController::class, 'connectedApps'])->name('home.apps');
    
    // Developer Portal
    Route::prefix('developer')->group(function () {
        Route::get('/apps', [DeveloperWebController::class, 'apps'])->name('developer.apps');
    });

    // Admin Console
    Route::middleware('admin')->prefix('admin')->group(function () {
        Route::get('/users', [AdminWebController::class, 'users'])->name('admin.users');
    });
});
```

### Phase 3: Migrating and Refactoring Components
Move all components from `UI components/DataHub-UI-Sandbox/src/components/` into `Auth/resources/js/pages/`.

**Crucial Refactoring Steps:**
1. **Remove `useNavigate` and `<Link>` from `react-router-dom`.** Replace them entirely with the Inertia `<Link>` component (`import { Link } from '@inertiajs/react'`).
2. **Remove `useEffect` API calls.** Replace mocked state arrays with data destructured from `usePage().props`.
3. **Form Submissions.** Replace `fetch()` POSTs with Inertia's `useForm` hook to ensure validation errors are automatically mapped to the UI.

#### Example: Refactoring App Moderation
```typescript
import { useForm, usePage } from '@inertiajs/react';

export default function AppModerationScreen() {
    // Data is injected by Laravel
    const { apps } = usePage().props;
    const { post } = useForm();

    const handleSuspend = (appId: string) => {
        if (confirm("Suspend this application?")) {
            post(`/admin/apps/${appId}/suspend`);
        }
    };

    return (
        // Render UI...
    );
}

// Define the persistent layout
AppModerationScreen.layout = page => <AppLayout><AdminLayout>{page}</AdminLayout></AppLayout>;
```

### Phase 4: Styling and Asset Migration
Move the massive `index.css` from the DataHub sandbox into `Auth/resources/css/app.css`. Ensure the `logoPath` references point to the correct Vite asset directory in Laravel (`resources/images/logo.png`).

---

## 6. Addressing Backend Limitations

While integrating, note the following locked features dictated by the backend state:
- **API Keys / Personal Access Tokens:** Currently disabled in the UI. While Laravel Passport supports Personal Access Tokens, the `Auth` backend controllers do not currently expose endpoints to generate or manage them. They remain locked behind a "Coming Soon" UI state.
- **Admin App Creation:** Admins moderate apps but do not create them. Only users via the Developer Portal can register OAuth clients.

## 7. Conclusion

By executing this master integration plan, the standalone DataHub UI will completely envelop the Laravel API, transitioning it from a headless authorization server into a monolithic, visually stunning, stateful web application. This unifies Account Management, OAuth Client Registration, and Platform Moderation under a single, secure roof.
