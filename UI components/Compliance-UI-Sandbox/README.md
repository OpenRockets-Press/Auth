# Compliance UI Sandbox: Implementation & Backend Integration Guide

## 1. Executive Summary

This document serves as the comprehensive, authoritative guide for the **Compliance UI Sandbox**. It details the architectural decisions, the current standalone state of the React components, the existing Laravel backend compliance endpoints, and an exhaustive step-by-step integration guide to merge this UI into the native Laravel Inertia.js stack.

Our goal is to ensure full compliance with global privacy frameworks, notably **GDPR** (General Data Protection Regulation) and **COPPA** (Children's Online Privacy Protection Act). The UI components developed here—specifically the `PrivacyCenterScreen` and `ParentalConsentScreen`—are designed to directly interface with the Data Request and Parental Consent systems in the `Auth` repository.

---

## 2. Current UI Implementation

The `Compliance-UI-Sandbox` was built as an isolated React SPA (Single Page Application) powered by Vite. It currently relies on mocked data and simulated API latency to demonstrate user flows.

### 2.1 Component Architecture

The directory structure is modular:
- `ParentalConsentScreen.tsx`: The COPPA verification portal where a parent/guardian approves or denies their child's account creation.
- `PrivacyCenterScreen.tsx`: The GDPR dashboard where users can request data exports or initiate account deletion.
- `AmbientBackground.tsx`: A decorative wrapper providing thematic, responsive background elements.
- `MicrosoftLoadingDots.tsx`: A micro-interaction component for state transitions (e.g., waiting for an API response).

### 2.2 Mocked State & API Hooks

Currently, the UI components utilize React's `useState` and `setTimeout` to mimic network requests. 

**PrivacyCenterScreen API Mocks:**
- **Data Export:** Mocks a `POST` to `/api/compliance/data/export`.
- **Data Deletion:** Mocks a `POST` to `/api/compliance/data/delete`.

**ParentalConsentScreen API Mocks:**
- **Consent Verification:** Mocks a `POST` to `/api/consent/verify/{token}` with a payload of `{ action: 'grant' | 'deny' }`.

---

## 3. Backend Architecture Analysis

A deep dive into the `Auth` repository reveals a robust Compliance engine driven by `ComplianceService` and `ComplianceController`. 

### 3.1 Route Mapping (`routes/api/compliance.php`)

The backend already exposes the necessary endpoints. We must map our UI components to these exact routes.

| Feature | Backend Route | HTTP Method | Controller Action | Rate Limit |
|---------|--------------|-------------|-------------------|------------|
| Parental Consent | `/api/consent/verify/{token}` | POST | `ComplianceController@respondToParentalConsent` | N/A |
| Data Export | `/api/compliance/data-export` | POST | `ComplianceController@requestDataExport` | 2 per min |
| Data Deletion | `/api/compliance/data-deletion` | POST | `ComplianceController@requestDataDeletion` | 3 per min |
| Request Status | `/api/compliance/data-requests` | GET | `ComplianceController@dataRequests` | N/A |

### 3.2 Data Models & Events

- **Models**: `DataAccessRequest` handles tracking the status of export and deletion requests. `Country` tracks jurisdictional requirements for COPPA/GDPR age limits.
- **Events**: Initiating these requests fires asynchronous events (`DataDeletionRequested`, `DataExportRequested`, `ParentalConsentRequested`), meaning the UI must handle "Pending" states properly as the backend processes these via queued jobs.

---

## 4. Gap Analysis & Integration Plan

To integrate these React components into the Laravel `Auth` backend, we must transition from a stateless REST API consumption model to a stateful **Inertia.js** model.

### 4.1 Inertia.js Paradigm Shift

Instead of the React components mounting and then fetching data (e.g., the child's profile for parental consent), Laravel will inject this data directly into the component via Inertia Page Props during the initial page load.

**Current React Flow:**
1. Browser loads UI.
2. React mounts.
3. `useEffect` fetches `/api/compliance/profile`.
4. UI renders data.

**Target Inertia Flow:**
1. Browser hits Laravel route `/privacy`.
2. Laravel `ComplianceController` fetches user data.
3. Controller returns `Inertia::render('compliance/PrivacyCenter', ['user' => $user])`.
4. UI mounts fully populated.

---

## 5. Step-by-Step Integration Guide

### Phase 1: Controller Adjustments

We must create Web controllers (or modify existing API controllers to return Inertia responses if accessed via web middleware).

```php
// app/Http/Controllers/Web/ComplianceWebController.php

namespace App\Http\Controllers\Web;

use Inertia\Inertia;
use Illuminate\Http\Request;

class ComplianceWebController extends Controller {
    
    public function privacyCenter(Request $request) {
        return Inertia::render('compliance/PrivacyCenterScreen', [
            'user' => $request->user()->only('name', 'email'),
            'requests' => $request->user()->dataAccessRequests
        ]);
    }

    public function parentalConsent(Request $request, $token) {
        // Validate token...
        return Inertia::render('compliance/ParentalConsentScreen', [
            'token' => $token,
            'child' => $childProfile
        ]);
    }
}
```

### Phase 2: Route Registration

Map the new Inertia views in `routes/web.php`.

```php
Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('/privacy', [ComplianceWebController::class, 'privacyCenter'])->name('privacy.center');
});

Route::get('/consent/verify/{token}', [ComplianceWebController::class, 'parentalConsent'])->name('consent.verify');
```

### Phase 3: React Component Refactoring

Move the components from `UI components/Compliance-UI-Sandbox/src/components` into `Auth/resources/js/pages/compliance/`.

#### Refactoring PrivacyCenterScreen.tsx

Replace the `setTimeout` mock logic with `@inertiajs/react`'s `useForm` hook.

```typescript
import { useForm, usePage } from '@inertiajs/react';

// Inside component:
const { user } = usePage().props;
const exportForm = useForm({});
const deleteForm = useForm({});

const handleExport = () => {
    exportForm.post('/api/compliance/data-export', {
        preserveScroll: true,
        onSuccess: () => alert('Export request queued!'),
    });
};

const handleDelete = () => {
    deleteForm.post('/api/compliance/data-deletion', {
        onSuccess: () => window.location.href = '/',
    });
};
```

#### Refactoring ParentalConsentScreen.tsx

```typescript
import { useForm, usePage } from '@inertiajs/react';

// Inside component:
const { child, token } = usePage().props;
const { post, processing } = useForm({
    action: ''
});

const handleAction = (decision: 'grant' | 'deny') => {
    post(`/api/consent/verify/${token}`, {
        data: { action: decision }
    });
};
```

### Phase 4: CSS Migration

Ensure that the global CSS variables and classes defined in `Compliance-UI-Sandbox/src/index.css` (such as `.ms-card`, `.theme-error`, `.ms-button`) are migrated into `Auth/resources/css/app.css` so the UI maintains its strict black-and-white high-contrast design system.

---

## 6. Testing & Validation

Once integrated, testing must be conducted to ensure:
1. **CSRF Protection**: Because we moved from API to Web, Inertia will automatically handle CSRF tokens via Axios. Ensure no 419 Page Expired errors occur.
2. **Rate Limiting**: Verify that clicking "Export Data" rapidly triggers the `throttle:2,60` middleware and displays an appropriate Inertia error prop.
3. **Queue Processing**: Verify that when a user requests an export, the `DataExportRequested` event fires, pushing a job to Laravel Horizon/Queue.

## 7. Conclusion

By following this specification, the Compliance UI Sandbox will be seamlessly absorbed into the monolithic Auth backend, providing users with a robust, legally compliant, and aesthetically premium data rights management dashboard.
