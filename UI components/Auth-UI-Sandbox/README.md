# OAuth UI Sandbox: Implementation & Backend Integration Guide

## 1. Executive Summary

This document serves as the exhaustive architectural guide for the **OAuth Consent UI Sandbox** (`Auth-UI-Sandbox`). It details the current standalone React implementation of the OAuth authorization flow and provides a comprehensive, step-by-step roadmap for migrating this UI into the core Laravel `Auth` backend using **Inertia.js**.

Our primary objective is to transform the decoupled, API-driven React component into a natively served Laravel view. This ensures maximum security, utilizes Laravel's built-in session management, and adheres strictly to the **OAuth 2.0 Authorization Code Flow with PKCE**.

---

## 2. Current UI Implementation

The `Auth-UI-Sandbox` was engineered as a decoupled React SPA. It is responsible for rendering the permission screen where a user grants a third-party application access to their DataHub account.

### 2.1 Component Architecture

The directory consists of two core files:
- `OAuthConsentScreen.tsx`: The primary authorization interface. It handles URL parameter parsing, loading states, scope rendering, and the final approve/deny submission.
- `MicrosoftLoadingDots.tsx`: A premium, micro-animation component used during network requests to maintain a high-quality user experience.

### 2.2 Current Execution Flow (Decoupled API Mode)

Currently, the `OAuthConsentScreen` behaves as an API client:
1. **Parameter Extraction:** It extracts `client_id`, `redirect_uri`, `response_type`, `scope`, and `state` from the browser URL (`window.location.search`).
2. **Data Fetching:** It mounts and immediately triggers a `useEffect` hook to `GET /api/oauth/authorize/details` (mocked in the sandbox) to retrieve the third-party app's name, logo, and requested scopes.
3. **Form Submission:** Upon clicking "Allow", it triggers a `POST` fetch request to `/api/oauth/authorize/consent` (mocked) to submit the user's decision, simulating a redirect back to the client application with an authorization `code`.

---

## 3. Backend Architecture Analysis

A thorough analysis of the `Auth` backend reveals a fully functional OAuth engine powered by Laravel Passport, specifically handled by the `AuthorizationController`.

### 3.1 Route Mapping (`routes/api/oauth.php`)

The backend routes are currently structured as stateless APIs:

| Feature | Backend Route | HTTP Method | Controller Action | Description |
|---------|--------------|-------------|-------------------|-------------|
| Authorization Start | `/api/oauth/authorize` | GET | `AuthorizationController@startAuthorization` | Validates client, scopes, and PKCE. Returns JSON details about the app. |
| Consent Submission | `/api/oauth/authorize/consent` | POST | `AuthorizationController@consent` | Processes the user's decision and generates the OAuth `code`. |

### 3.2 The Controller Architecture

`Auth/app/Http/Controllers/Api/OAuth/AuthorizationController.php` contains robust security logic:
- Validates the `client_id` against the `oauth_clients` table.
- Enforces PKCE (`code_challenge` and `code_challenge_method`).
- Checks if the user has already granted identical scopes (`ConsentRecord`). If so, it silently auto-approves and generates the code.
- If consent is required, it returns a massive JSON payload containing the client's metadata, the user's metadata, and the `consent_endpoint` URL.

---

## 4. Gap Analysis & Integration Strategy

The fundamental gap is that the backend currently treats Authorization as a pure JSON API (`response()->json(...)`), whereas standard OAuth implementations serve the consent screen directly from the Authorization Server using cookies/sessions.

To bridge this gap, we must migrate the routing from the stateless `api` middleware to the stateful `web` middleware and replace the JSON responses with **Inertia.js** renders.

### 4.1 The Inertia.js Paradigm Shift

We will eliminate the `useEffect` fetching logic entirely. Instead of the React app asking the backend for the app details, Laravel will compile the details and *push* them into the React component upon page load via Inertia props.

---

## 5. Step-by-Step Integration Guide

### Phase 1: Controller Refactoring

Modify `AuthorizationController` to support Inertia.

```php
// app/Http/Controllers/Web/OAuth/AuthorizationController.php

namespace App\Http\Controllers\Web\OAuth;

use Inertia\Inertia;
// ... other imports

class AuthorizationController extends Controller {

    public function startAuthorization(Request $request) {
        // ... execute existing validation logic ...
        
        // Replace response()->json() with Inertia::render()
        return Inertia::render('oauth/ConsentScreen', [
            'client' => [
                'id' => $app->id,
                'name' => $app->name,
                'icon_url' => $app->icon_url,
                // ...
            ],
            'user' => [
                'name' => $user->name,
                'email' => $user->email,
            ],
            'requested_scopes' => $requestedScopes,
            'auth_request' => [
                'redirect_uri' => $validated['redirect_uri'],
                'state' => $validated['state'] ?? null,
                'code_challenge' => $validated['code_challenge'],
                'code_challenge_method' => $validated['code_challenge_method'] ?? 'S256',
            ]
        ]);
    }

    public function consent(Request $request) {
        // ... execute existing validation and code generation logic ...
        
        // Instead of returning JSON with the redirect_url, perform an actual HTTP redirect via Inertia
        return Inertia::location($redirectUrl);
    }
}
```

### Phase 2: Route Migration

Move the endpoints from `routes/api/oauth.php` to a web-based route file (e.g., `routes/web.php` or `routes/oauth.php` loaded with web middleware).

```php
Route::middleware(['web', 'auth'])->group(function () {
    Route::get('/oauth/authorize', [\App\Http\Controllers\Web\OAuth\AuthorizationController::class, 'startAuthorization']);
    Route::post('/oauth/authorize/consent', [\App\Http\Controllers\Web\OAuth\AuthorizationController::class, 'consent']);
});
```

### Phase 3: React Component Refactoring

Move `OAuthConsentScreen.tsx` into `Auth/resources/js/pages/oauth/ConsentScreen.tsx`.

Remove all `useEffect` fetch logic and standard DOM form submissions, replacing them with Inertia's `useForm` and `usePage`.

```typescript
import { useForm, usePage } from '@inertiajs/react';

export default function ConsentScreen() {
    // 1. Receive data directly from Laravel
    const { client, user, requested_scopes, auth_request } = usePage().props;

    // 2. Setup Inertia Form
    const { data, setData, post, processing } = useForm({
        client_id: client.id,
        redirect_uri: auth_request.redirect_uri,
        response_type: 'code',
        scope: requested_scopes.join(' '),
        state: auth_request.state,
        code_challenge: auth_request.code_challenge,
        code_challenge_method: auth_request.code_challenge_method,
        approve: false
    });

    // 3. Handle Submission
    const handleAction = (decision: boolean) => {
        setData('approve', decision);
        // Note: Inertia requires a slight delay to ensure state updates before posting
        setTimeout(() => {
            post('/oauth/authorize/consent');
        }, 0);
    };

    return (
        // ... render UI using the props ...
    );
}
```

### Phase 4: Styling Integration

The aesthetic success of this UI relies heavily on the `index.css` file crafted in the Sandbox. Ensure all custom classes (e.g., `.oauth-container`, `.scope-list`, `.ms-button`) are migrated into the main Laravel Vite asset pipeline (`resources/css/app.css`).

---

## 6. Security Considerations

1. **Session Hijacking**: By moving to the `web` middleware group, the flow is protected by Laravel's encrypted cookies.
2. **CSRF Protection**: Inertia handles CSRF tokens automatically via Axios, protecting the `/oauth/authorize/consent` POST endpoint out-of-the-box.
3. **PKCE Enforcement**: The UI must flawlessly pass the `code_challenge` back to the controller. Do not drop these parameters during the form submission.

## 7. Conclusion

By executing this integration plan, the standalone OAuth UI Sandbox will be transformed into a highly secure, stateful, native Laravel interface, providing a seamless and visually premium authorization experience for third-party developers and end-users alike.
