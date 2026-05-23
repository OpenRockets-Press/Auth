<?php

use App\Models\User;
use PragmaRX\Google2FA\Google2FA;

test('user can enable 2FA', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/enable');

    $response->assertOk()
        ->assertJsonStructure(['qr_code_url']);

    expect($user->fresh()->two_factor_secret)->not->toBeNull();
});

test('enabling 2FA returns 400 if already enabled', function () {
    $user = User::factory()->withTwoFactor()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/enable');

    $response->assertStatus(400)
        ->assertJson(['message' => '2FA is already enabled.']);
});

test('user can confirm 2FA with valid code', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/enable');

    $user->refresh();
    $secret = decrypt($user->two_factor_secret);
    $g2fa = new Google2FA;
    $code = $g2fa->getCurrentOtp($secret);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/confirm', [
            'code' => $code,
        ]);

    $response->assertOk()
        ->assertJson(['message' => '2FA confirmed and enabled.']);

    expect($user->fresh()->two_factor_confirmed_at)->not->toBeNull();
});

test('confirming 2FA with invalid code returns 422', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/enable');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/confirm', [
            'code' => '000000',
        ]);

    $response->assertUnprocessable()
        ->assertJson(['message' => 'Invalid code.']);
});

test('confirming 2FA without enabling returns 400', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/confirm', [
            'code' => '123456',
        ]);

    $response->assertStatus(400)
        ->assertJson(['message' => '2FA is not enabled.']);
});

test('confirming 2FA requires 6 digit code', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/enable');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/confirm', [
            'code' => '123',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['code']);
});

test('user can disable 2FA', function () {
    $user = User::factory()->withTwoFactor()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/disable');

    $response->assertOk()
        ->assertJson(['message' => '2FA disabled.']);

    $user->refresh();
    expect($user->two_factor_secret)->toBeNull();
    expect($user->two_factor_confirmed_at)->toBeNull();
});

test('disabling 2FA without enabling returns 400', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/disable');

    $response->assertStatus(400)
        ->assertJson(['message' => '2FA is not enabled.']);
});

test('user can get recovery codes when 2FA is enabled', function () {
    $user = User::factory()->withTwoFactor()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/2fa/recovery-codes');

    $response->assertOk()
        ->assertJsonStructure(['recovery_codes']);
});

test('getting recovery codes without 2FA returns 400', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/2fa/recovery-codes');

    $response->assertStatus(400)
        ->assertJson(['message' => '2FA is not enabled.']);
});

test('enabling 2FA creates audit log', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/enable');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $user->id,
        'event_type' => 'security.2fa.setup',
    ]);
});

test('disabling 2FA creates audit log', function () {
    $user = User::factory()->withTwoFactor()->create();
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/2fa/disable');

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $user->id,
        'event_type' => 'security.2fa.removed',
    ]);
});

test('unauthenticated 2FA requests return 401', function () {
    $this->postJson('/api/2fa/enable')->assertUnauthorized();
    $this->postJson('/api/2fa/confirm', ['code' => '123456'])->assertUnauthorized();
    $this->postJson('/api/2fa/disable')->assertUnauthorized();
    $this->getJson('/api/2fa/recovery-codes')->assertUnauthorized();
});
