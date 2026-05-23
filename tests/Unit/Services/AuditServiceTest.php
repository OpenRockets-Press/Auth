<?php

use App\Models\Compliance\AuditLog;
use App\Models\OAuth\App;
use App\Models\User;
use App\Services\AuditService;

test('log creates audit entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->log('test.event', $user, data: ['key' => 'value']);

    expect($log)->toBeInstanceOf(AuditLog::class);
    expect($log->event_type)->toBe('test.event');
    expect($log->user_id)->toBe($user->id);
    expect($log->event_data)->toBe(['key' => 'value']);
});

test('log login success creates correct entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logLogin($user, 'password', true);

    expect($log->event_type)->toBe('auth.login.success');
    expect($log->event_data['method'])->toBe('password');
});

test('log login failure creates correct entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logLogin($user, 'password', false);

    expect($log->event_type)->toBe('auth.login.failed');
    expect($log->event_data['method'])->toBe('password');
});

test('log logout creates correct entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logLogout($user);

    expect($log->event_type)->toBe('auth.logout');
});

test('log registration creates correct entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logRegistration($user);

    expect($log->event_type)->toBe('auth.registration');
});

test('log two factor setup creates correct entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logTwoFactorSetup($user);

    expect($log->event_type)->toBe('security.2fa.setup');
});

test('log two factor removed creates correct entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logTwoFactorRemoved($user);

    expect($log->event_type)->toBe('security.2fa.removed');
});

test('log consent granted creates correct entry', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logConsentGranted($user, $app, ['profile', 'email']);

    expect($log->event_type)->toBe('oauth.consent.granted');
    expect($log->app_id)->toBe($app->id);
    expect($log->event_data['scopes'])->toBe(['profile', 'email']);
});

test('log consent revoked creates correct entry', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logConsentRevoked($user, $app);

    expect($log->event_type)->toBe('oauth.consent.revoked');
    expect($log->app_id)->toBe($app->id);
});

test('log app registered creates correct entry', function () {
    $owner = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $owner->id]);
    $service = app(AuditService::class);

    $log = $service->logAppRegistered($app);

    expect($log->event_type)->toBe('app.registered');
    expect($log->user_id)->toBe($owner->id);
    expect($log->app_id)->toBe($app->id);
});

test('log app verified creates correct entry', function () {
    $admin = User::factory()->create();
    $app = App::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logAppVerified($admin, $app);

    expect($log->event_type)->toBe('app.verified');
    expect($log->user_id)->toBe($admin->id);
    expect($log->app_id)->toBe($app->id);
});

test('log app suspended creates correct entry', function () {
    $admin = User::factory()->create();
    $app = App::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logAppSuspended($admin, $app);

    expect($log->event_type)->toBe('app.suspended');
    expect($log->user_id)->toBe($admin->id);
    expect($log->app_id)->toBe($app->id);
});

test('log data export requested creates correct entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logDataExportRequested($user);

    expect($log->event_type)->toBe('compliance.data.export.requested');
});

test('log data deletion requested creates correct entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logDataDeletionRequested($user);

    expect($log->event_type)->toBe('compliance.data.deletion.requested');
});

test('log parental consent requested creates correct entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logParentalConsentRequested($user, 'parent@example.com');

    expect($log->event_type)->toBe('compliance.parental.consent.requested');
    expect($log->event_data['parent_email'])->toBe('parent@example.com');
});

test('log parental consent granted creates correct entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logParentalConsentGranted($user);

    expect($log->event_type)->toBe('compliance.parental.consent.granted');
});

test('log social account linked creates correct entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logSocialAccountLinked($user, 'google');

    expect($log->event_type)->toBe('social.account.linked');
    expect($log->event_data['provider'])->toBe('google');
});

test('log social account unlinked creates correct entry', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logSocialAccountUnlinked($user, 'google');

    expect($log->event_type)->toBe('social.account.unlinked');
    expect($log->event_data['provider'])->toBe('google');
});

test('log datahub store creates correct entry', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logDataHubStore($user, $app, 'preferences');

    expect($log->event_type)->toBe('datahub.store');
    expect($log->event_data['key'])->toBe('preferences');
});

test('log datahub access creates correct entry', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create();
    $grantingApp = App::factory()->create();
    $service = app(AuditService::class);

    $log = $service->logDataHubAccess($user, $requestingApp, $grantingApp);

    expect($log->event_type)->toBe('datahub.access');
    expect($log->app_id)->toBe($requestingApp->id);
    expect($log->event_data['granting_app_id'])->toBe($grantingApp->id);
});

test('audit log cannot be updated', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->log('test.event', $user);

    $result = $log->update(['event_type' => 'modified.event']);

    expect($result)->toBeFalse();
});

test('audit log cannot be deleted', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->log('test.event', $user);
    $id = $log->id;

    $log->delete();

    $this->assertDatabaseHas('audit_logs', ['id' => $id]);
});

test('audit log has created_at set automatically', function () {
    $user = User::factory()->create();
    $service = app(AuditService::class);

    $log = $service->log('test.event', $user);

    expect($log->created_at)->not->toBeNull();
});
