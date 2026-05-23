<?php

use App\Models\OAuth\App;
use App\Models\User;
use App\Services\OAuthService;

test('user can list their apps', function () {
    $user = User::factory()->create();
    App::factory()->count(3)->create(['owner_id' => $user->id]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/apps');

    // Debug: dump response structure
    // dump($response->json());

    $response->assertOk()
        ->assertJsonCount(3)
        ->assertJsonStructure([
            '*' => ['id', 'name', 'description', 'status'],
        ]);
});

test('user can only see their own apps', function () {
    $user1 = User::factory()->create();
    App::factory()->count(2)->create(['owner_id' => $user1->id]);

    $user2 = User::factory()->create();
    $token = $user2->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/apps');

    $response->assertOk();
    expect($response->json())->toHaveCount(0);
});

test('user can filter apps by status', function () {
    $user = User::factory()->create();
    App::factory()->create(['owner_id' => $user->id, 'status' => 'verified']);
    App::factory()->create(['owner_id' => $user->id, 'status' => 'pending']);
    App::factory()->create(['owner_id' => $user->id, 'status' => 'suspended']);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/apps?status=verified');

    $response->assertOk();
    expect($response->json())->toHaveCount(1);
    expect($response->json('0.status'))->toBe('verified');
});

test('user can create a new app', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/apps', [
            'name' => 'Test App',
            'redirect_uris' => ['https://example.com/callback'],
            'description' => 'A test application',
            'homepage_url' => 'https://example.com',
            'privacy_policy_url' => 'https://example.com/privacy',
            'terms_url' => 'https://example.com/terms',
            'category' => 'productivity',
        ]);

    $response->assertCreated()
        ->assertJsonStructure(['id', 'name', 'description', 'status', 'redirect_uris'])
        ->assertJson([
            'name' => 'Test App',
            'status' => 'pending',
        ]);

    $this->assertDatabaseHas('apps', [
        'name' => 'Test App',
        'owner_id' => $user->id,
    ]);
});

test('creating app requires name and redirect_uris', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/apps', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['name', 'redirect_uris']);
});

test('user can view their app details', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/apps/'.$app->id);

    $response->assertOk()
        ->assertJsonStructure(['id', 'name', 'description', 'status'])
        ->assertJson(['id' => $app->id]);
});

test('user cannot view another users app', function () {
    $owner = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $owner->id]);

    $otherUser = User::factory()->create();
    $token = $otherUser->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/apps/'.$app->id);

    $response->assertForbidden();
});

test('user can update their app', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->putJson('/api/apps/'.$app->id, [
            'name' => 'Updated App Name',
            'description' => 'Updated description',
        ]);

    $response->assertOk()
        ->assertJson([
            'name' => 'Updated App Name',
            'description' => 'Updated description',
        ]);

    expect($app->fresh()->name)->toBe('Updated App Name');
});

test('user cannot update another users app', function () {
    $owner = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $owner->id]);

    $otherUser = User::factory()->create();
    $token = $otherUser->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->putJson('/api/apps/'.$app->id, [
            'name' => 'Hacked App',
        ]);

    $response->assertForbidden();
});

test('user can regenerate client secret', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    // Create app through the service so it has an OAuth client
    $app = app(OAuthService::class)->registerApp($user, [
        'name' => 'Test App',
        'redirect_uris' => ['https://example.com/callback'],
    ]);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/apps/'.$app->id.'/regenerate-secret', ['confirm' => true]);

    $response->assertOk()
        ->assertJsonStructure(['message', 'client_secret']);

    expect($response->json('client_secret'))->not->toBeNull();
});

test('user cannot regenerate secret for another users app', function () {
    $owner = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $owner->id]);

    $otherUser = User::factory()->create();
    $token = $otherUser->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/apps/'.$app->id.'/regenerate-secret');

    $response->assertForbidden();
});

test('user can view consents for their app', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/apps/'.$app->id.'/consents');

    $response->assertOk()
        ->assertJsonStructure([
            '*' => ['id', 'user_id', 'app_id', 'scopes'],
        ]);
});

test('user can revoke all consents for their app', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->deleteJson('/api/apps/'.$app->id.'/consents');

    $response->assertOk()
        ->assertJson(['message' => 'All consents revoked.']);
});

test('unauthenticated app requests return 401', function () {
    $this->getJson('/api/apps')->assertUnauthorized();
    $this->postJson('/api/apps', [])->assertUnauthorized();
});

test('creating app creates audit log', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/apps', [
            'name' => 'Test App',
            'redirect_uris' => ['https://example.com/callback'],
        ]);

    $this->assertDatabaseHas('audit_logs', [
        'event_type' => 'app.registered',
    ]);
});
