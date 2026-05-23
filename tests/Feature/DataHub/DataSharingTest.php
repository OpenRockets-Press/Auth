<?php

use App\Models\DataHub\DataRequest;
use App\Models\DataHub\DataSharingAgreement;
use App\Models\DataHub\UserDataStore;
use App\Models\OAuth\App;
use App\Models\User;

test('user can request data sharing between apps', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create(['owner_id' => $user->id]);
    $targetApp = App::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/data-hub/'.$requestingApp->id.'/request-sharing', [
            'target_app_id' => $targetApp->id,
            'data_keys' => ['profile', 'email'],
        ]);

    $response->assertCreated()
        ->assertJsonStructure(['id', 'requesting_app_id', 'target_app_id', 'status'])
        ->assertJson([
            'status' => 'pending',
        ]);

    $this->assertDatabaseHas('data_requests', [
        'user_id' => $user->id,
        'requesting_app_id' => $requestingApp->id,
        'target_app_id' => $targetApp->id,
    ]);
});

test('user can grant data sharing consent', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create();
    $targetApp = App::factory()->create();

    $dataRequest = DataRequest::factory()->create([
        'user_id' => $user->id,
        'requesting_app_id' => $requestingApp->id,
        'target_app_id' => $targetApp->id,
        'data_keys' => ['profile', 'email'],
    ]);

    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/data-hub/requests/'.$dataRequest->id.'/grant');

    $response->assertOk()
        ->assertJsonStructure(['id', 'consent_status'])
        ->assertJson([
            'consent_status' => 'granted',
        ]);

    $this->assertDatabaseHas('data_sharing_agreements', [
        'user_id' => $user->id,
        'source_app_id' => $targetApp->id,
        'target_app_id' => $requestingApp->id,
        'consent_status' => 'granted',
    ]);
});

test('user can deny data sharing consent', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create();
    $targetApp = App::factory()->create();

    $dataRequest = DataRequest::factory()->create([
        'user_id' => $user->id,
        'requesting_app_id' => $requestingApp->id,
        'target_app_id' => $targetApp->id,
    ]);

    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/data-hub/requests/'.$dataRequest->id.'/deny');

    $response->assertOk()
        ->assertJson(['message' => 'Data sharing consent denied.']);

    expect($dataRequest->fresh()->user_consent_status)->toBe('denied');
});

test('user cannot grant consent for another users request', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $requestingApp = App::factory()->create();
    $targetApp = App::factory()->create();

    $dataRequest = DataRequest::factory()->create([
        'user_id' => $user1->id,
        'requesting_app_id' => $requestingApp->id,
        'target_app_id' => $targetApp->id,
    ]);

    $token = $user2->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/data-hub/requests/'.$dataRequest->id.'/grant');

    $response->assertForbidden()
        ->assertJson(['message' => 'Unauthorized.']);
});

test('user can exchange token with valid agreement', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create(['owner_id' => $user->id]);
    $grantingApp = App::factory()->create();

    DataSharingAgreement::factory()->create([
        'user_id' => $user->id,
        'source_app_id' => $grantingApp->id,
        'target_app_id' => $requestingApp->id,
        'data_keys' => ['profile', 'email'],
        'consent_status' => 'granted',
    ]);

    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/data-hub/'.$requestingApp->id.'/exchange-token', [
            'granting_app_id' => $grantingApp->id,
            'scopes' => ['read'],
        ]);

    $response->assertOk()
        ->assertJsonStructure([
            'access_token',
            'token_type',
            'expires_at',
        ]);

    $this->assertDatabaseHas('data_access_tokens', [
        'user_id' => $user->id,
        'requesting_app_id' => $requestingApp->id,
        'granting_app_id' => $grantingApp->id,
    ]);
});

test('token exchange fails without agreement', function () {
    $user = User::factory()->create();
    $requestingApp = App::factory()->create(['owner_id' => $user->id]);
    $grantingApp = App::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/data-hub/'.$requestingApp->id.'/exchange-token', [
            'granting_app_id' => $grantingApp->id,
            'scopes' => ['read'],
        ]);

    $response->assertInternalServerError();
});

test('user can list their data sharing agreements', function () {
    $user = User::factory()->create();
    $sourceApp = App::factory()->create();
    $targetApp = App::factory()->create();

    DataSharingAgreement::factory()->count(2)->create([
        'user_id' => $user->id,
        'source_app_id' => $sourceApp->id,
        'target_app_id' => $targetApp->id,
    ]);

    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/data-hub/agreements');

    $response->assertOk()
        ->assertJsonStructure([
            '*' => ['id', 'consent_status'],
        ]);

    expect($response->json())->toHaveCount(2);
});

test('user can revoke data sharing agreement', function () {
    $user = User::factory()->create();
    $sourceApp = App::factory()->create();
    $targetApp = App::factory()->create();

    $agreement = DataSharingAgreement::factory()->create([
        'user_id' => $user->id,
        'source_app_id' => $sourceApp->id,
        'target_app_id' => $targetApp->id,
    ]);

    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->deleteJson('/api/data-hub/agreements/'.$agreement->id);

    $response->assertOk()
        ->assertJson(['message' => 'Data sharing agreement revoked.']);

    expect($agreement->fresh()->revoked_at)->not->toBeNull();
});

test('user cannot revoke another users agreement', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $sourceApp = App::factory()->create();
    $targetApp = App::factory()->create();

    $agreement = DataSharingAgreement::factory()->create([
        'user_id' => $user1->id,
        'source_app_id' => $sourceApp->id,
        'target_app_id' => $targetApp->id,
    ]);

    $token = $user2->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->deleteJson('/api/data-hub/agreements/'.$agreement->id);

    $response->assertNotFound();
});

test('revoking agreement deletes associated tokens', function () {
    $user = User::factory()->create();
    $sourceApp = App::factory()->create();
    $targetApp = App::factory()->create();

    $agreement = DataSharingAgreement::factory()->create([
        'user_id' => $user->id,
        'source_app_id' => $sourceApp->id,
        'target_app_id' => $targetApp->id,
    ]);

    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->deleteJson('/api/data-hub/agreements/'.$agreement->id);

    expect($user->dataAccessTokens()->count())->toBe(0);
});

test('unauthenticated data sharing requests return 401', function () {
    $this->postJson('/api/data-hub/1/request-sharing', [
        'target_app_id' => 2,
        'data_keys' => ['profile'],
    ])->assertUnauthorized();

    $this->postJson('/api/data-hub/requests/1/grant')->assertUnauthorized();
    $this->postJson('/api/data-hub/requests/1/deny')->assertUnauthorized();
    $this->getJson('/api/data-hub/agreements')->assertUnauthorized();
});
