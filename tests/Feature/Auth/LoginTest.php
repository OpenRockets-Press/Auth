<?php

use App\Models\User;
use Illuminate\Support\Facades\Hash;

beforeEach(function () {
    config(['auth-system.max_login_attempts' => 5]);
    config(['auth-system.lockout_duration' => 60]);
    config(['auth-system.session_lifetime_minutes' => 480]);
});

test('users can login with valid credentials', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password123',
    ]);

    $response->assertOk()
        ->assertJsonStructure([
            'access_token',
            'token_type',
            'expires_in',
            'user' => ['id', 'name', 'email'],
        ]);

    $this->assertDatabaseHas('users', [
        'id' => $user->id,
        'failed_login_attempts' => 0,
    ]);

    expect($user->fresh()->last_login_at)->not->toBeNull();
});

test('login fails with invalid email', function () {
    $response = $this->postJson('/api/auth/login', [
        'email' => 'nonexistent@example.com',
        'password' => 'password123',
    ]);

    $response->assertUnauthorized()
        ->assertJson(['message' => 'Invalid credentials.']);
});

test('login fails with invalid password', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertUnauthorized()
        ->assertJson(['message' => 'Invalid credentials.']);

    expect($user->fresh()->failed_login_attempts)->toBe(1);
});

test('login validates email format', function () {
    $response = $this->postJson('/api/auth/login', [
        'email' => 'not-an-email',
        'password' => 'password123',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

test('login requires email and password', function () {
    $response = $this->postJson('/api/auth/login', []);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email', 'password']);
});

test('account locks after max failed attempts', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
        'failed_login_attempts' => 4,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $response->assertUnauthorized();

    $user->refresh();
    expect($user->failed_login_attempts)->toBe(5);
    expect($user->locked_until)->not->toBeNull();
});

test('locked account returns 429', function () {
    $user = User::factory()->locked()->create([
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password123',
    ]);

    $response->assertStatus(429)
        ->assertJsonStructure(['message', 'retry_after']);
});

test('suspended account returns 403', function () {
    $user = User::factory()->suspended()->create([
        'password' => Hash::make('password123'),
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password123',
    ]);

    $response->assertForbidden()
        ->assertJson(['message' => 'Account has been suspended.']);
});

test('successful login resets failed attempts', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
        'failed_login_attempts' => 3,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password123',
    ]);

    $response->assertOk();

    expect($user->fresh()->failed_login_attempts)->toBe(0);
    expect($user->fresh()->locked_until)->toBeNull();
});

test('login returns risk assessment for non-low risk', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
        'failed_login_attempts' => 1,
    ]);

    $response = $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password123',
    ]);

    $response->assertOk();
    $response->assertJsonStructure(['risk' => ['score', 'level', 'factors', 'require_step_up']]);
});

test('login creates audit log entry', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'password123',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $user->id,
        'event_type' => 'auth.login.success',
    ]);
});

test('failed login creates audit log entry', function () {
    $user = User::factory()->create([
        'password' => Hash::make('password123'),
    ]);

    $this->postJson('/api/auth/login', [
        'email' => $user->email,
        'password' => 'wrong-password',
    ]);

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $user->id,
        'event_type' => 'auth.login.failed',
    ]);
});

test('user can logout', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/auth/logout');

    $response->assertOk()
        ->assertJson(['message' => 'Logged out successfully.']);
});

test('authenticated user can get profile', function () {
    $user = User::factory()->create();
    $token = $user->createToken('test-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/auth/me');

    $response->assertOk()
        ->assertJsonStructure([
            'id',
            'name',
            'email',
            'email_verified_at',
            'status',
            'last_login_at',
            'profile',
            'roles',
            'created_at',
        ])
        ->assertJson([
            'id' => $user->id,
            'email' => $user->email,
        ]);
});

test('unauthenticated request to me returns 401', function () {
    $response = $this->getJson('/api/auth/me');

    $response->assertUnauthorized();
});

test('user can register with valid data', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertCreated()
        ->assertJsonStructure([
            'access_token',
            'token_type',
            'user' => ['id', 'name', 'email'],
        ]);

    $this->assertDatabaseHas('users', [
        'email' => 'newuser@example.com',
        'name' => 'New User',
    ]);
});

test('registration requires unique email', function () {
    User::factory()->create(['email' => 'existing@example.com']);

    $response = $this->postJson('/api/auth/register', [
        'name' => 'New User',
        'email' => 'existing@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['email']);
});

test('registration requires password confirmation', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'password' => 'password123',
        'password_confirmation' => 'different',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['password']);
});

test('registration requires minimum 8 character password', function () {
    $response = $this->postJson('/api/auth/register', [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'password' => 'short',
        'password_confirmation' => 'short',
    ]);

    $response->assertUnprocessable()
        ->assertJsonValidationErrors(['password']);
});

test('registration creates audit log', function () {
    $this->postJson('/api/auth/register', [
        'name' => 'New User',
        'email' => 'newuser@example.com',
        'password' => 'password123',
        'password_confirmation' => 'password123',
    ]);

    $user = User::where('email', 'newuser@example.com')->first();

    $this->assertDatabaseHas('audit_logs', [
        'user_id' => $user->id,
        'event_type' => 'auth.registration',
    ]);
});
