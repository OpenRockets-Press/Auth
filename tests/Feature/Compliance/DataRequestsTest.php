<?php

use App\Models\Compliance\DataAccessRequest;
use App\Models\User;

test('user can request data export', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/compliance/data-export');

    $response->assertCreated()
        ->assertJsonStructure(['id', 'request_type', 'status'])
        ->assertJson([
            'request_type' => 'export',
            'status' => 'pending',
        ]);

    $this->assertDatabaseHas('data_access_requests', [
        'user_id' => $user->id,
        'request_type' => 'export',
        'status' => 'pending',
    ]);
});

test('user can request data deletion', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/compliance/data-deletion');

    $response->assertCreated()
        ->assertJsonStructure(['id', 'request_type', 'status'])
        ->assertJson([
            'request_type' => 'deletion',
            'status' => 'pending',
        ]);

    $this->assertDatabaseHas('data_access_requests', [
        'user_id' => $user->id,
        'request_type' => 'deletion',
        'status' => 'pending',
    ]);
});

test('user can list their data requests', function () {
    $user = User::factory()->create();
    DataAccessRequest::factory()->count(3)->create(['user_id' => $user->id]);
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/compliance/data-requests');

    $response->assertOk()
        ->assertJsonStructure([
            '*' => ['id', 'request_type', 'status'],
        ]);

    expect($response->json())->toHaveCount(3);
});

test('user sees only their own data requests', function () {
    $user1 = User::factory()->create();
    $user2 = User::factory()->create();

    DataAccessRequest::factory()->count(2)->create(['user_id' => $user1->id]);

    $token = $user2->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/compliance/data-requests');

    $response->assertOk();
    expect($response->json())->toHaveCount(0);
});

test('data export request creates audit log', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/compliance/data-export');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $user->id,
        'event_type' => 'compliance.data.export.requested',
    ]);
});

test('data deletion request creates audit log', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/compliance/data-deletion');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $user->id,
        'event_type' => 'compliance.data.deletion.requested',
    ]);
});

test('unauthenticated data request returns 401', function () {
    $this->postJson('/api/compliance/data-export')->assertUnauthorized();
    $this->postJson('/api/compliance/data-deletion')->assertUnauthorized();
    $this->getJson('/api/compliance/data-requests')->assertUnauthorized();
});

test('user can create multiple data requests', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/compliance/data-export');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/compliance/data-deletion');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/compliance/data-requests');

    $response->assertOk();
    expect($response->json())->toHaveCount(2);
});
