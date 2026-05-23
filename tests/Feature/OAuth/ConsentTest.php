<?php

use App\Models\OAuth\App;
use App\Models\OAuth\ConsentRecord;
use App\Models\User;

test('user can grant consent to an app', function () {
    $user = User::factory()->create();
    $app = App::factory()->verified()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/consent/'.$app->id.'/grant', [
            'scopes' => ['profile', 'email'],
        ]);

    $response->assertCreated()
        ->assertJsonStructure(['id', 'scopes'])
        ->assertJson([
            'scopes' => ['profile', 'email'],
        ]);

    $this->assertDatabaseHas('consent_records', [
        'user_id' => $user->id,
        'app_id' => $app->id,
    ]);
});

test('user can view their consents', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();
    ConsentRecord::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
        'scopes' => ['profile'],
    ]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/consent/my');

    $response->assertOk()
        ->assertJsonStructure([
            '*' => ['id', 'scopes'],
        ]);

    expect($response->json())->toHaveCount(1);
});

test('granting consent requires scopes', function () {
    $user = User::factory()->create();
    $app = App::factory()->verified()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/consent/'.$app->id.'/grant', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['scopes']);
});

test('user sees only their own consents', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $app = App::factory()->create();

    ConsentRecord::factory()->create([
        'user_id' => $user1->id,
        'app_id' => $app->id,
    ]);

    $token = $user2->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/consent/my');

    $response->assertOk();
    expect($response->json())->toHaveCount(0);
});

test('user can revoke their consent', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();
    $consent = ConsentRecord::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
    ]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->deleteJson('/api/consent/'.$consent->id);

    $response->assertOk()
        ->assertJson(['message' => 'Consent revoked.']);

    expect($consent->fresh()->revoked_at)->not->toBeNull();
});

test('user cannot revoke another users consent', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $app = App::factory()->create();

    $consent = ConsentRecord::factory()->create([
        'user_id' => $user1->id,
        'app_id' => $app->id,
    ]);

    $token = $user2->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->deleteJson('/api/consent/'.$consent->id);

    $response->assertForbidden()
        ->assertJson(['message' => 'Unauthorized.']);
});

test('granting consent merges scopes with existing consent', function () {
    $user = User::factory()->create();
    $app = App::factory()->verified()->create();

    ConsentRecord::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
        'scopes' => ['profile'],
    ]);

    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/consent/'.$app->id.'/grant', [
            'scopes' => ['email'],
        ]);

    $response->assertCreated();

    $this->assertDatabaseHas('consent_records', [
        'user_id' => $user->id,
        'app_id' => $app->id,
    ]);

    $record = ConsentRecord::where('user_id', $user->id)
        ->where('app_id', $app->id)
        ->first();

    expect($record->scopes)->toContain('profile', 'email');
});

test('granting consent creates audit log', function () {
    $user = User::factory()->create();
    $app = App::factory()->verified()->create();
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/consent/'.$app->id.'/grant', [
            'scopes' => ['profile'],
        ]);

    $this->assertDatabaseHas('audit_logs', [
        'event_type' => 'oauth.consent.granted',
        'user_id' => $user->id,
    ]);
});

test('revoking consent creates audit log', function () {
    $user = User::factory()->create();
    $app = App::factory()->create();
    $consent = ConsentRecord::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
    ]);
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->deleteJson('/api/consent/'.$consent->id);

    $this->assertDatabaseHas('audit_logs', [
        'event_type' => 'oauth.consent.revoked',
        'user_id' => $user->id,
    ]);
});

test('unauthenticated consent requests return 401', function () {
    $this->getJson('/api/consent/my')->assertUnauthorized();
    $this->postJson('/api/consent/1/grant', ['scopes' => ['profile']])->assertUnauthorized();
    $this->deleteJson('/api/consent/1')->assertUnauthorized();
});
