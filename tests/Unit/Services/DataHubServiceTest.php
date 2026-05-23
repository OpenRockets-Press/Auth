<?php

use App\Models\DataHub\DataAccessToken;
use App\Models\DataHub\DataRequest;
use App\Models\DataHub\DataSharingAgreement;
use App\Models\DataHub\UserDataStore;
use App\Models\OAuth\App;
use App\Models\User;
use App\Services\DataHubService;

test('storeData creates or updates data store', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $service = app(DataHubService::class);

    $store = $service->storeData($user, $app, 'preferences', ['theme' => 'dark']);

    expect($store)->toBeInstanceOf(UserDataStore::class);
    expect($store->key)->toBe('preferences');

    $this->assertDatabaseHas('user_data_stores', [
        'user_id' => $user->id,
        'app_id' => $app->id,
        'key' => 'preferences',
    ]);
});

test('storeData updates existing record with same key', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $service = app(DataHubService::class);

    $service->storeData($user, $app, 'preferences', ['theme' => 'light']);
    $service->storeData($user, $app, 'preferences', ['theme' => 'dark']);

    expect(UserDataStore::count())->toBe(1);

    $store = UserDataStore::first();
    expect($store->value['theme'])->toBe('dark');
});

test('getData returns stored value', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $service = app(DataHubService::class);

    $service->storeData($user, $app, 'preferences', ['theme' => 'dark']);

    $value = $service->getData($user, $app, 'preferences');

    expect($value)->toBe(['theme' => 'dark']);
});

test('getData returns default when key does not exist', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $service = app(DataHubService::class);

    $value = $service->getData($user, $app, 'nonexistent', 'default-value');

    expect($value)->toBe('default-value');
});

test('getAllData returns all data for user and app', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $service = app(DataHubService::class);

    $service->storeData($user, $app, 'preferences', ['theme' => 'dark']);
    $service->storeData($user, $app, 'settings', ['notifications' => true]);

    $data = $service->getAllData($user, $app);

    expect($data)->toHaveCount(2);
    expect($data['preferences'])->toBe(['theme' => 'dark']);
    expect($data['settings'])->toBe(['notifications' => true]);
});

test('deleteData removes specific key', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $service = app(DataHubService::class);

    $service->storeData($user, $app, 'preferences', ['theme' => 'dark']);

    $result = $service->deleteData($user, $app, 'preferences');

    expect($result)->toBeTrue();
    expect(UserDataStore::count())->toBe(0);
});

test('deleteData returns false for non-existent key', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $service = app(DataHubService::class);

    $result = $service->deleteData($user, $app, 'nonexistent');

    expect($result)->toBeFalse();
});

test('deleteAllData removes all data for user and app', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $service = app(DataHubService::class);

    $service->storeData($user, $app, 'key1', 'value1');
    $service->storeData($user, $app, 'key2', 'value2');
    $service->storeData($user, $app, 'key3', 'value3');

    $service->deleteAllData($user, $app);

    expect(UserDataStore::count())->toBe(0);
});

test('requestDataSharing creates data request', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create(['owner_id' => $user->id]);
    $targetApp = App::factory()->create();
    $service = app(DataHubService::class);

    $request = $service->requestDataSharing($user, $requestingApp, $targetApp, ['profile', 'email']);

    expect($request)->toBeInstanceOf(DataRequest::class);
    expect($request->status)->toBe('pending');
    expect($request->data_keys)->toBe(['profile', 'email']);
});

test('grantDataSharingConsent creates agreement', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create();
    $targetApp = App::factory()->create();

    $dataRequest = DataRequest::factory()->create([
        'user_id' => $user->id,
        'requesting_app_id' => $requestingApp->id,
        'target_app_id' => $targetApp->id,
        'data_keys' => ['profile', 'email'],
    ]);

    $service = app(DataHubService::class);
    $agreement = $service->grantDataSharingConsent($dataRequest);

    expect($agreement)->toBeInstanceOf(DataSharingAgreement::class);
    expect($agreement->consent_status)->toBe('granted');
    expect($agreement->source_app_id)->toBe($targetApp->id);
    expect($agreement->target_app_id)->toBe($requestingApp->id);

    expect($dataRequest->fresh()->user_consent_status)->toBe('granted');
});

test('denyDataSharingConsent updates request', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create();
    $targetApp = App::factory()->create();

    $dataRequest = DataRequest::factory()->create([
        'user_id' => $user->id,
        'requesting_app_id' => $requestingApp->id,
        'target_app_id' => $targetApp->id,
    ]);

    $service = app(DataHubService::class);
    $service->denyDataSharingConsent($dataRequest);

    expect($dataRequest->fresh()->user_consent_status)->toBe('denied');
});

test('exchangeToken creates access token', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create(['owner_id' => $user->id]);
    $grantingApp = App::factory()->create();

    DataSharingAgreement::factory()->create([
        'user_id' => $user->id,
        'source_app_id' => $grantingApp->id,
        'target_app_id' => $requestingApp->id,
        'data_keys' => ['profile'],
        'consent_status' => 'granted',
    ]);

    $service = app(DataHubService::class);
    $token = $service->exchangeToken($user, $requestingApp, $grantingApp, ['read']);

    expect($token)->toBeInstanceOf(DataAccessToken::class);
    expect($token->scopes)->toBe(['read']);
    expect($token->expires_at)->not->toBeNull();
});

test('exchangeToken throws exception without agreement', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create(['owner_id' => $user->id]);
    $grantingApp = App::factory()->create();
    $service = app(DataHubService::class);

    expect(fn () => $service->exchangeToken($user, $requestingApp, $grantingApp, ['read']))
        ->toThrow(RuntimeException::class, 'No active data sharing agreement exists.');
});

test('validateDataAccessToken returns token when valid', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create();
    $grantingApp = App::factory()->create();

    $token = DataAccessToken::factory()->create([
        'user_id' => $user->id,
        'requesting_app_id' => $requestingApp->id,
        'granting_app_id' => $grantingApp->id,
    ]);

    $service = app(DataHubService::class);
    $validated = $service->validateDataAccessToken($token->token);

    expect($validated)->not->toBeNull();
    expect($validated->token)->toBe($token->token);
});

test('validateDataAccessToken returns null for expired token', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create();
    $grantingApp = App::factory()->create();

    $token = DataAccessToken::factory()->expired()->create([
        'user_id' => $user->id,
        'requesting_app_id' => $requestingApp->id,
        'granting_app_id' => $grantingApp->id,
    ]);

    $service = app(DataHubService::class);
    $validated = $service->validateDataAccessToken($token->token);

    expect($validated)->toBeNull();
});

test('validateDataAccessToken returns null for invalid token', function () {
    $service = app(DataHubService::class);

    $validated = $service->validateDataAccessToken('invalid-token');

    expect($validated)->toBeNull();
});

test('revokeDataSharingAgreement revokes agreement', function () {
    $user = User::factory()->create();
    $sourceApp = App::factory()->create();
    $targetApp = App::factory()->create();

    $agreement = DataSharingAgreement::factory()->create([
        'user_id' => $user->id,
        'source_app_id' => $sourceApp->id,
        'target_app_id' => $targetApp->id,
    ]);

    $service = app(DataHubService::class);
    $service->revokeDataSharingAgreement($agreement);

    expect($agreement->fresh()->revoked_at)->not->toBeNull();
});

test('revokeDataSharingAgreement deletes associated tokens', function () {
    $user = User::factory()->create();
    $sourceApp = App::factory()->create();
    $targetApp = App::factory()->create();

    $agreement = DataSharingAgreement::factory()->create([
        'user_id' => $user->id,
        'source_app_id' => $sourceApp->id,
        'target_app_id' => $targetApp->id,
    ]);

    DataAccessToken::factory()->create([
        'user_id' => $user->id,
        'requesting_app_id' => $targetApp->id,
        'granting_app_id' => $sourceApp->id,
    ]);

    $service = app(DataHubService::class);
    $service->revokeDataSharingAgreement($agreement);

    expect(DataAccessToken::count())->toBe(0);
});
