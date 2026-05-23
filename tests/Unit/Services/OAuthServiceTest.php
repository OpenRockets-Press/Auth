<?php

use App\Models\OAuth\App;
use App\Models\OAuth\ConsentRecord;
use App\Models\User;
use App\Services\OAuthService;

test('registerApp creates app and OAuth client', function () {
    $owner = User::factory()->create();
    $service = app(OAuthService::class);

    $app = $service->registerApp($owner, [
        'name' => 'Test App',
        'redirect_uris' => ['https://example.com/callback'],
        'description' => 'A test app',
    ]);

    expect($app)->toBeInstanceOf(App::class);
    expect($app->name)->toBe('Test App');
    expect($app->status)->toBe('pending');
    expect($app->owner_id)->toBe($owner->id);

    $this->assertDatabaseHas('apps', [
        'name' => 'Test App',
        'owner_id' => $owner->id,
    ]);
});

test('updateApp updates app fields', function () {
    $owner = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $owner->id]);
    $service = app(OAuthService::class);

    $updated = $service->updateApp($app, [
        'name' => 'Updated App',
        'description' => 'Updated description',
    ]);

    expect($updated->name)->toBe('Updated App');
    expect($updated->description)->toBe('Updated description');
});

test('updateApp preserves existing values when not provided', function () {
    $owner = User::factory()->create();
    $app = App::factory()->create([
        'owner_id' => $owner->id,
        'name' => 'Original Name',
        'description' => 'Original description',
    ]);
    $service = app(OAuthService::class);

    $updated = $service->updateApp($app, [
        'name' => 'New Name',
    ]);

    expect($updated->name)->toBe('New Name');
    expect($updated->description)->toBe('Original description');
});

test('verifyApp updates status to verified', function () {
    $admin = User::factory()->create();
    $app = App::factory()->create(['status' => 'pending']);
    $service = app(OAuthService::class);

    $verified = $service->verifyApp($app, $admin);

    expect($verified->status)->toBe('verified');
    expect($verified->verified_at)->not->toBeNull();
});

test('rejectApp updates status to rejected', function () {
    $admin = User::factory()->create();
    $app = App::factory()->create(['status' => 'pending']);
    $service = app(OAuthService::class);

    $rejected = $service->rejectApp($app, $admin);

    expect($rejected->status)->toBe('rejected');
});

test('suspendApp updates status to suspended', function () {
    $admin = User::factory()->create();
    $app = App::factory()->verified()->create();
    $service = app(OAuthService::class);

    $suspended = $service->suspendApp($app, $admin);

    expect($suspended->status)->toBe('suspended');
    expect($suspended->suspended_at)->not->toBeNull();
});

test('unsuspendApp restores app to verified', function () {
    $admin = User::factory()->create();
    $app = App::factory()->suspended()->create();
    $service = app(OAuthService::class);

    $unsuspended = $service->unsuspendApp($app, $admin);

    expect($unsuspended->status)->toBe('verified');
    expect($unsuspended->suspended_at)->toBeNull();
});

test('validateRedirectUri returns true for valid URI', function () {
    $owner = User::factory()->create();
    $app = App::factory()->create([
        'owner_id' => $owner->id,
        'redirect_uris' => ['https://example.com/callback', 'https://example.com/callback2'],
    ]);
    $service = app(OAuthService::class);

    expect($service->validateRedirectUri($app, 'https://example.com/callback'))->toBeTrue();
});

test('validateRedirectUri returns false for invalid URI', function () {
    $owner = User::factory()->create();
    $app = App::factory()->create([
        'owner_id' => $owner->id,
        'redirect_uris' => ['https://example.com/callback'],
    ]);
    $service = app(OAuthService::class);

    expect($service->validateRedirectUri($app, 'https://evil.com/callback'))->toBeFalse();
});

test('grantConsent creates new consent record', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();
    $service = app(OAuthService::class);

    $record = $service->grantConsent($user, $app, ['profile', 'email']);

    expect($record)->toBeInstanceOf(ConsentRecord::class);
    expect($record->scopes)->toBe(['profile', 'email']);
    expect($record->granted_at)->not->toBeNull();
});

test('grantConsent merges scopes with existing consent', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();

    ConsentRecord::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
        'scopes' => ['profile'],
    ]);

    $service = app(OAuthService::class);
    $record = $service->grantConsent($user, $app, ['email']);

    expect($record->scopes)->toContain('profile', 'email');
});

test('revokeConsent sets revoked_at', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();
    $record = ConsentRecord::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
    ]);
    $service = app(OAuthService::class);

    $service->revokeConsent($record);

    expect($record->fresh()->revoked_at)->not->toBeNull();
});

test('revokeAllConsents revokes all active consents', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();

    ConsentRecord::factory()->count(3)->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
    ]);

    $service = app(OAuthService::class);
    $service->revokeAllConsents($user, $app);

    expect(ConsentRecord::where('user_id', $user->id)
        ->where('app_id', $app->id)
        ->whereNull('revoked_at')
        ->count())->toBe(0);
});

test('hasConsent returns true when consent exists', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();

    ConsentRecord::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
        'scopes' => ['profile', 'email'],
    ]);

    $service = app(OAuthService::class);

    expect($service->hasConsent($user, $app))->toBeTrue();
});

test('hasConsent returns false when consent does not exist', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();
    $service = app(OAuthService::class);

    expect($service->hasConsent($user, $app))->toBeFalse();
});

test('hasConsent returns false when consent is revoked', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();

    ConsentRecord::factory()->revoked()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
    ]);

    $service = app(OAuthService::class);

    expect($service->hasConsent($user, $app))->toBeFalse();
});

test('hasConsent validates required scopes', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();

    ConsentRecord::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
        'scopes' => ['profile', 'email'],
    ]);

    $service = app(OAuthService::class);

    expect($service->hasConsent($user, $app, ['profile']))->toBeTrue();
    expect($service->hasConsent($user, $app, ['profile', 'email']))->toBeTrue();
    expect($service->hasConsent($user, $app, ['profile', 'admin']))->toBeFalse();
});

test('getActiveConsents returns only non-revoked consents', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();

    ConsentRecord::factory()->count(2)->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
    ]);
    ConsentRecord::factory()->revoked()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
    ]);

    $service = app(OAuthService::class);
    $consents = $service->getActiveConsents($user);

    expect($consents)->toHaveCount(2);
});
