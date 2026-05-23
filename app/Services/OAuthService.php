<?php

namespace App\Services;

use App\Models\OAuth\App;
use App\Models\OAuth\AppScope;
use App\Models\OAuth\ConsentRecord;
use App\Models\User;
use Illuminate\Support\Str;

class OAuthService
{
    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function registerApp(User $owner, array $data): App
    {
        $app = App::create([
            'owner_id' => $owner->id,
            'name' => $data['name'],
            'description' => $data['description'] ?? null,
            'icon_url' => $data['icon_url'] ?? null,
            'status' => 'pending',
            'is_system' => false,
            'redirect_uris' => $data['redirect_uris'],
            'homepage_url' => $data['homepage_url'] ?? null,
            'privacy_policy_url' => $data['privacy_policy_url'] ?? null,
            'terms_url' => $data['terms_url'] ?? null,
            'category' => $data['category'] ?? null,
        ]);

        $this->auditService->logAppRegistered($app);

        return $app;
    }

    public function updateApp(App $app, array $data): App
    {
        $app->update([
            'name' => $data['name'] ?? $app->name,
            'description' => $data['description'] ?? $app->description,
            'icon_url' => $data['icon_url'] ?? $app->icon_url,
            'redirect_uris' => $data['redirect_uris'] ?? $app->redirect_uris,
            'homepage_url' => $data['homepage_url'] ?? $app->homepage_url,
            'privacy_policy_url' => $data['privacy_policy_url'] ?? $app->privacy_policy_url,
            'terms_url' => $data['terms_url'] ?? $app->terms_url,
            'category' => $data['category'] ?? $app->category,
        ]);

        return $app;
    }

    public function regenerateClientSecret(App $app): string
    {
        if (! $app->client) {
            throw new \RuntimeException('App has no associated OAuth client.');
        }

        $app->client->secret = Str::random(40);
        $app->client->save();

        return $app->client->secret;
    }

    public function verifyApp(App $app, User $admin): App
    {
        $app->update([
            'status' => 'verified',
            'verified_at' => now(),
        ]);

        $this->auditService->logAppVerified($admin, $app);

        return $app;
    }

    public function rejectApp(App $app, User $admin): App
    {
        $app->update([
            'status' => 'rejected',
        ]);

        return $app;
    }

    public function suspendApp(App $app, User $admin): App
    {
        $app->update([
            'status' => 'suspended',
            'suspended_at' => now(),
        ]);

        $this->auditService->logAppSuspended($admin, $app);

        return $app;
    }

    public function unsuspendApp(App $app, User $admin): App
    {
        $app->update([
            'status' => 'verified',
            'suspended_at' => null,
        ]);

        return $app;
    }

    public function validateRedirectUri(App $app, string $redirectUri): bool
    {
        return in_array($redirectUri, $app->redirect_uris, true);
    }

    public function grantConsent(User $user, App $app, array $scopes, string $method = 'oauth_screen'): ConsentRecord
    {
        $existing = ConsentRecord::where('user_id', $user->id)
            ->where('app_id', $app->id)
            ->whereNull('revoked_at')
            ->first();

        if ($existing) {
            $existing->update([
                'scopes' => array_unique(array_merge($existing->scopes, $scopes)),
            ]);

            return $existing;
        }

        $record = ConsentRecord::create([
            'user_id' => $user->id,
            'app_id' => $app->id,
            'scopes' => $scopes,
            'consent_method' => $method,
            'ip_address' => request()?->ip(),
            'user_agent' => request()?->userAgent(),
            'granted_at' => now(),
        ]);

        $this->auditService->logConsentGranted($user, $app, $scopes);

        return $record;
    }

    public function revokeConsent(ConsentRecord $record): void
    {
        $record->revoke();
        $this->auditService->logConsentRevoked($record->user, $record->app);
    }

    public function revokeAllConsents(User $user, App $app): void
    {
        ConsentRecord::where('user_id', $user->id)
            ->where('app_id', $app->id)
            ->whereNull('revoked_at')
            ->get()
            ->each(fn ($record) => $this->revokeConsent($record));
    }

    public function addScope(App $app, string $name, ?string $description = null, bool $isRequired = false): AppScope
    {
        return AppScope::create([
            'app_id' => $app->id,
            'name' => $name,
            'description' => $description,
            'is_required' => $isRequired,
        ]);
    }

    public function getActiveConsents(User $user): array
    {
        return ConsentRecord::where('user_id', $user->id)
            ->whereNull('revoked_at')
            ->with('app')
            ->get()
            ->toArray();
    }

    public function hasConsent(User $user, App $app, array $requiredScopes = []): bool
    {
        $consent = ConsentRecord::where('user_id', $user->id)
            ->where('app_id', $app->id)
            ->whereNull('revoked_at')
            ->first();

        if (! $consent) {
            return false;
        }

        if (empty($requiredScopes)) {
            return true;
        }

        return empty(array_diff($requiredScopes, $consent->scopes));
    }
}
