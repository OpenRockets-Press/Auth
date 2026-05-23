<?php

use App\Models\Compliance\Country;
use App\Models\Compliance\ParentalConsent;
use App\Models\User;
use Database\Seeders\CountrySeeder;

beforeEach(function () {
    $this->seed(CountrySeeder::class);
});

test('user can request parental consent', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/compliance/parental-consent/request', [
            'parent_email' => 'parent@example.com',
            'parent_name' => 'Parent Name',
        ]);

    $response->assertCreated()
        ->assertJsonStructure(['message', 'consent_id'])
        ->assertJson(['message' => 'Parental consent request sent.']);

    $this->assertDatabaseHas('parental_consents', [
        'user_id' => $user->id,
        'parent_email' => 'parent@example.com',
        'consent_status' => 'pending',
    ]);
});

test('requesting parental consent requires valid email', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/compliance/parental-consent/request', [
            'parent_email' => 'not-an-email',
        ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['parent_email']);
});

test('requesting parental consent requires parent_email', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/compliance/parental-consent/request', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['parent_email']);
});

test('parent can grant consent via token', function () {
    $user = User::factory()->create();
    $consent = ParentalConsent::factory()->create([
        'user_id' => $user->id,
        'consent_status' => 'pending',
        'verification_token' => 'test-token-123',
    ]);

    $response = $this->postJson('/api/consent/verify/test-token-123', [
        'action' => 'grant',
    ]);

    $response->assertOk()
        ->assertJson([
            'message' => 'Consent granted successfully.',
            'consent_status' => 'granted',
        ]);

    expect($consent->fresh()->consent_status)->toBe('granted');
    expect($consent->fresh()->granted_at)->not->toBeNull();
});

test('parent can deny consent via token', function () {
    $user = User::factory()->create();
    $consent = ParentalConsent::factory()->create([
        'user_id' => $user->id,
        'consent_status' => 'pending',
        'verification_token' => 'test-token-456',
    ]);

    $response = $this->postJson('/api/consent/verify/test-token-456', [
        'action' => 'deny',
    ]);

    $response->assertOk()
        ->assertJson([
            'message' => 'Consent denied.',
            'consent_status' => 'denied',
        ]);

    expect($consent->fresh()->consent_status)->toBe('denied');
});

test('invalid token returns 404', function () {
    $response = $this->postJson('/api/consent/verify/invalid-token', [
        'action' => 'grant',
    ]);

    $response->assertNotFound();
});

test('already processed token returns error', function () {
    $user = User::factory()->create();
    $consent = ParentalConsent::factory()->granted()->create([
        'user_id' => $user->id,
        'verification_token' => 'already-used-token',
    ]);

    $response = $this->postJson('/api/consent/verify/already-used-token', [
        'action' => 'grant',
    ]);

    $response->assertNotFound();
});

test('granting consent updates user profile status', function () {
    $user = User::factory()->create();
    $user->profile()->create([
        'country_code' => 'US',
        'date_of_birth' => now()->subYears(15),
        'parental_consent_required' => true,
        'parental_consent_status' => 'pending',
    ]);

    ParentalConsent::factory()->create([
        'user_id' => $user->id,
        'consent_status' => 'pending',
        'verification_token' => 'profile-update-token',
    ]);

    $this->postJson('/api/consent/verify/profile-update-token', [
        'action' => 'grant',
    ]);

    expect($user->fresh()->profile->parental_consent_status)->toBe('granted');
});

test('denying consent updates user profile status', function () {
    $user = User::factory()->create();
    $user->profile()->create([
        'country_code' => 'US',
        'date_of_birth' => now()->subYears(15),
        'parental_consent_required' => true,
        'parental_consent_status' => 'pending',
    ]);

    ParentalConsent::factory()->create([
        'user_id' => $user->id,
        'consent_status' => 'pending',
        'verification_token' => 'deny-update-token',
    ]);

    $this->postJson('/api/consent/verify/deny-update-token', [
        'action' => 'deny',
    ]);

    expect($user->fresh()->profile->parental_consent_status)->toBe('denied');
});

test('requesting parental consent creates audit log', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/compliance/parental-consent/request', [
            'parent_email' => 'parent@example.com',
        ]);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $user->id,
        'event_type' => 'compliance.parental.consent.requested',
    ]);
});

test('granting parental consent creates audit log', function () {
    $user = User::factory()->create();
    ParentalConsent::factory()->create([
        'user_id' => $user->id,
        'consent_status' => 'pending',
        'verification_token' => 'audit-test-token',
    ]);

    $this->postJson('/api/consent/verify/audit-test-token', [
        'action' => 'grant',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $user->id,
        'event_type' => 'compliance.parental.consent.granted',
    ]);
});

test('unauthenticated parental consent request returns 401', function () {
    $this->postJson('/api/compliance/parental-consent/request', [
        'parent_email' => 'parent@example.com',
    ])->assertUnauthorized();
});
