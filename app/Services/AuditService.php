<?php

namespace App\Services;

use App\Models\Compliance\AuditLog;
use App\Models\OAuth\App;
use App\Models\User;

class AuditService
{
    public function log(string $eventType, ?User $user = null, ?App $app = null, array $data = [], ?string $ipAddress = null, ?string $userAgent = null): AuditLog
    {
        return AuditLog::create([
            'user_id' => $user?->id,
            'app_id' => $app?->id,
            'event_type' => $eventType,
            'event_data' => $data,
            'ip_address' => $ipAddress ?? request()?->ip(),
            'user_agent' => $userAgent ?? request()?->userAgent(),
        ]);
    }

    public function logLogin(User $user, string $method, bool $success, array $data = []): AuditLog
    {
        return $this->log(
            $success ? 'auth.login.success' : 'auth.login.failed',
            $user,
            data: array_merge(['method' => $method], $data)
        );
    }

    public function logLogout(User $user): AuditLog
    {
        return $this->log('auth.logout', $user);
    }

    public function logRegistration(User $user): AuditLog
    {
        return $this->log('auth.registration', $user);
    }

    public function logTwoFactorSetup(User $user): AuditLog
    {
        return $this->log('security.2fa.setup', $user);
    }

    public function logTwoFactorRemoved(User $user): AuditLog
    {
        return $this->log('security.2fa.removed', $user);
    }

    public function logPasskeyRegistered(User $user, string $passkeyName): AuditLog
    {
        return $this->log('security.passkey.registered', $user, data: ['passkey_name' => $passkeyName]);
    }

    public function logPasskeyRemoved(User $user, string $passkeyName): AuditLog
    {
        return $this->log('security.passkey.removed', $user, data: ['passkey_name' => $passkeyName]);
    }

    public function logPasswordChanged(User $user): AuditLog
    {
        return $this->log('security.password.changed', $user);
    }

    public function logConsentGranted(User $user, App $app, array $scopes): AuditLog
    {
        return $this->log('oauth.consent.granted', $user, $app, data: ['scopes' => $scopes]);
    }

    public function logConsentRevoked(User $user, App $app): AuditLog
    {
        return $this->log('oauth.consent.revoked', $user, $app);
    }

    public function logAppRegistered(App $app): AuditLog
    {
        return $this->log('app.registered', $app->owner, $app);
    }

    public function logAppVerified(User $admin, App $app): AuditLog
    {
        return $this->log('app.verified', $admin, $app);
    }

    public function logAppSuspended(User $admin, App $app): AuditLog
    {
        return $this->log('app.suspended', $admin, $app);
    }

    public function logAppUnsuspended(User $admin, App $app): AuditLog
    {
        return $this->log('app.unsuspended', $admin, $app);
    }

    public function logAppRejected(User $admin, App $app): AuditLog
    {
        return $this->log('app.rejected', $admin, $app);
    }

    public function logDataExportRequested(User $user): AuditLog
    {
        return $this->log('compliance.data.export.requested', $user);
    }

    public function logDataDeletionRequested(User $user): AuditLog
    {
        return $this->log('compliance.data.deletion.requested', $user);
    }

    public function logParentalConsentRequested(User $user, string $parentEmail): AuditLog
    {
        return $this->log('compliance.parental.consent.requested', $user, data: ['parent_email' => $parentEmail]);
    }

    public function logParentalConsentGranted(User $user): AuditLog
    {
        return $this->log('compliance.parental.consent.granted', $user);
    }

    public function logSocialAccountLinked(User $user, string $provider): AuditLog
    {
        return $this->log('social.account.linked', $user, data: ['provider' => $provider]);
    }

    public function logSocialAccountUnlinked(User $user, string $provider): AuditLog
    {
        return $this->log('social.account.unlinked', $user, data: ['provider' => $provider]);
    }

    public function logDataHubStore(User $user, App $app, string $key): AuditLog
    {
        return $this->log('datahub.store', $user, $app, data: ['key' => $key]);
    }

    public function logDataHubAccess(User $user, App $requestingApp, App $grantingApp): AuditLog
    {
        return $this->log('datahub.access', $user, $requestingApp, data: ['granting_app_id' => $grantingApp->id]);
    }
}
