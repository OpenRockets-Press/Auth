<?php

use App\Models\User;

test('authenticated user can list sessions', function () {
    $user = User::factory()->create();
    $user->createToken('session-1');
    $user->createToken('session-2');
    $token = $user->createToken('current-session');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/sessions');

    $response->assertOk()
        ->assertJsonStructure([
            'sessions' => [
                '*' => ['id', 'name', 'scopes', 'last_used_at', 'expires_at', 'created_at'],
            ],
        ]);

    expect($response->json('sessions'))->toHaveCount(3);
});

test('user sees only their own sessions', function () {
    $user1 = User::factory()->create();
    $user1->createToken('user1-session');

    $user2 = User::factory()->create();
    $token = $user2->createToken('user2-session');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/sessions');

    $response->assertOk();
    expect($response->json('sessions'))->toHaveCount(1);
    expect($response->json('sessions.0.name'))->toBe('user2-session');
});

test('user can revoke a specific session', function () {
    $user = User::factory()->create();
    $token1 = $user->createToken('session-to-revoke');
    $token2 = $user->createToken('current-session');

    $tokenId = $user->tokens()->where('name', 'session-to-revoke')->value('id');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token2->accessToken])
        ->deleteJson('/api/sessions/'.$tokenId);

    $response->assertOk()
        ->assertJson(['message' => 'Session revoked.']);
});

test('user cannot revoke another users session', function () {
    $user1 = User::factory()->create();
    $user1->createToken('user1-session');

    $user2 = User::factory()->create();
    $currentToken = $user2->createToken('user2-session');

    $tokenId = $user1->tokens()->value('id');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$currentToken->accessToken])
        ->deleteJson('/api/sessions/'.$tokenId);

    $response->assertNotFound();
});

test('user can revoke all sessions', function () {
    $user = User::factory()->create();
    $user->createToken('session-1');
    $user->createToken('session-2');
    $token = $user->createToken('current-session');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->deleteJson('/api/sessions');

    $response->assertOk()
        ->assertJson(['message' => 'All sessions revoked.']);

    expect($user->tokens()->count())->toBe(0);
});

test('sessions are ordered by creation date descending', function () {
    $user = User::factory()->create();
    $user->createToken('older-session');
    sleep(1);
    $user->createToken('newer-session');
    sleep(1);
    $token = $user->createToken('current-session');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/sessions');

    $response->assertOk();
    $sessions = $response->json('sessions');

    expect($sessions[0]['name'])->toBe('current-session');
});

test('unauthenticated session requests return 401', function () {
    $this->getJson('/api/sessions')->assertUnauthorized();
    $this->deleteJson('/api/sessions/1')->assertUnauthorized();
    $this->deleteJson('/api/sessions')->assertUnauthorized();
});

test('revoking non-existent session returns 404', function () {
    $user = User::factory()->create();
    $token = $user->createToken('current-session');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->deleteJson('/api/sessions/99999');

    $response->assertNotFound();
});
