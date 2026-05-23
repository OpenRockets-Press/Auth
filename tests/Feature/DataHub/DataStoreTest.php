<?php

use App\Models\DataHub\UserDataStore;
use App\Models\OAuth\App;
use App\Models\User;

test('user can store data for an app', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/data-hub/'.$app->id.'/store', [
            'key' => 'preferences',
            'value' => ['theme' => 'dark', 'language' => 'en'],
        ]);

    $response->assertCreated()
        ->assertJson([
            'message' => 'Data stored successfully.',
            'key' => 'preferences',
        ]);

    $this->assertDatabaseHas('user_data_stores', [
        'user_id' => $user->id,
        'app_id' => $app->id,
        'key' => 'preferences',
    ]);
});

test('storing data with same key updates existing record', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    UserDataStore::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
        'key' => 'preferences',
        'value' => ['theme' => 'light'],
    ]);
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/data-hub/'.$app->id.'/store', [
            'key' => 'preferences',
            'value' => ['theme' => 'dark'],
        ]);

    expect(UserDataStore::count())->toBe(1);

    $store = UserDataStore::first();
    expect($store->value['theme'])->toBe('dark');
});

test('user can get all data for an app', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    UserDataStore::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
        'key' => 'preferences',
        'value' => ['theme' => 'dark'],
    ]);
    UserDataStore::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
        'key' => 'settings',
        'value' => ['notifications' => true],
    ]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/data-hub/'.$app->id.'/data');

    $response->assertOk()
        ->assertJsonStructure(['data'])
        ->assertJson([
            'data' => [
                'preferences' => ['theme' => 'dark'],
                'settings' => ['notifications' => true],
            ],
        ]);
});

test('user can get specific data by key', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    UserDataStore::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
        'key' => 'preferences',
        'value' => ['theme' => 'dark'],
    ]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/data-hub/'.$app->id.'/data/preferences');

    $response->assertOk()
        ->assertJson([
            'key' => 'preferences',
            'value' => ['theme' => 'dark'],
        ]);
});

test('getting non-existent data returns 404', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/data-hub/'.$app->id.'/data/nonexistent');

    $response->assertNotFound()
        ->assertJson(['message' => 'Data not found.']);
});

test('user can delete data by key', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    UserDataStore::factory()->create([
        'user_id' => $user->id,
        'app_id' => $app->id,
        'key' => 'preferences',
        'value' => ['theme' => 'dark'],
    ]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->deleteJson('/api/data-hub/'.$app->id.'/data/preferences');

    $response->assertOk()
        ->assertJson(['message' => 'Data deleted.']);

    $this->assertDatabaseMissing('user_data_stores', [
        'user_id' => $user->id,
        'app_id' => $app->id,
        'key' => 'preferences',
    ]);
});

test('deleting non-existent data returns 404', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->deleteJson('/api/data-hub/'.$app->id.'/data/nonexistent');

    $response->assertNotFound()
        ->assertJson(['message' => 'Data not found.']);
});

test('user can only access their own data', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user1->id]);

    UserDataStore::factory()->create([
        'user_id' => $user1->id,
        'app_id' => $app->id,
        'key' => 'preferences',
        'value' => ['theme' => 'dark'],
    ]);

    $token = $user2->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/data-hub/'.$app->id.'/data');

    $response->assertOk();
    expect($response->json('data'))->toHaveCount(0);
});

test('storing data creates audit log', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/data-hub/'.$app->id.'/store', [
            'key' => 'preferences',
            'value' => ['theme' => 'dark'],
        ]);

    $this->assertDatabaseHas('audit_logs', [
        'event_type' => 'datahub.store',
        'user_id' => $user->id,
    ]);
});

test('unauthenticated data hub requests return 401', function () {
    $this->postJson('/api/data-hub/1/store', ['key' => 'test', 'value' => []])->assertUnauthorized();
    $this->getJson('/api/data-hub/1/data')->assertUnauthorized();
    $this->getJson('/api/data-hub/1/data/test')->assertUnauthorized();
    $this->deleteJson('/api/data-hub/1/data/test')->assertUnauthorized();
});

test('store data requires key and value', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $user->id]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/data-hub/'.$app->id.'/store', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['key', 'value']);
});
