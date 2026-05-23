<?php

use App\Models\Admin\Role;
use App\Models\Compliance\AuditLog;
use App\Models\Compliance\DataAccessRequest;
use App\Models\OAuth\App;
use App\Models\OAuth\ConsentRecord;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('admin can view analytics', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/analytics');

    $response->assertOk()
        ->assertJsonStructure([
            'total_users',
            'active_users',
            'suspended_users',
            'total_apps',
            'verified_apps',
            'pending_apps',
            'total_consents',
            'total_audit_events',
            'pending_data_requests',
            'users_last_24h',
            'logins_last_24h',
        ]);
});

test('analytics returns correct user counts', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    User::factory()->count(5)->create(['status' => 'active']);
    User::factory()->count(2)->create(['status' => 'suspended']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/analytics');

    $response->assertOk();
    expect($response->json('total_users'))->toBe(8);
    expect($response->json('active_users'))->toBe(6);
    expect($response->json('suspended_users'))->toBe(2);
});

test('analytics returns correct app counts', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    App::factory()->count(3)->create(['status' => 'verified']);
    App::factory()->count(2)->create(['status' => 'pending']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/analytics');

    $response->assertOk();
    expect($response->json('total_apps'))->toBe(5);
    expect($response->json('verified_apps'))->toBe(3);
    expect($response->json('pending_apps'))->toBe(2);
});

test('analytics returns correct consent count', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $app = App::factory()->create();
    ConsentRecord::factory()->count(4)->create(['app_id' => $app->id]);
    ConsentRecord::factory()->revoked()->create(['app_id' => $app->id]);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/analytics');

    $response->assertOk();
    expect($response->json('total_consents'))->toBe(4);
});

test('analytics returns correct audit event count', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    AuditLog::factory()->count(10)->create();

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/analytics');

    $response->assertOk();
    expect($response->json('total_audit_events'))->toBe(10);
});

test('analytics returns pending data requests count', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $user = User::factory()->create();
    DataAccessRequest::factory()->count(3)->create(['user_id' => $user->id, 'status' => 'pending']);
    DataAccessRequest::factory()->create(['user_id' => $user->id, 'status' => 'fulfilled']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/analytics');

    $response->assertOk();
    expect($response->json('pending_data_requests'))->toBe(3);
});

test('analytics counts users created in last 24 hours', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    User::factory()->count(3)->create(['created_at' => now()->subHours(12)]);
    User::factory()->create(['created_at' => now()->subDays(2)]);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/analytics');

    $response->assertOk();
    expect($response->json('users_last_24h'))->toBe(4);
});

test('analytics counts logins in last 24 hours', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $user = User::factory()->create();
    AuditLog::factory()->count(5)->create([
        'user_id' => $user->id,
        'event_type' => 'auth.login.success',
        'created_at' => now()->subHours(6),
    ]);
    AuditLog::factory()->create([
        'user_id' => $user->id,
        'event_type' => 'auth.login.success',
        'created_at' => now()->subDays(2),
    ]);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/analytics');

    $response->assertOk();
    expect($response->json('logins_last_24h'))->toBeGreaterThanOrEqual(5);
});

test('non-admin cannot view analytics', function () {
    $user = User::factory()->create();
    $token = $user->createToken('user-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/analytics');

    $response->assertForbidden();
});

test('unauthenticated analytics request returns 401', function () {
    $this->getJson('/api/admin/analytics')->assertUnauthorized();
});

test('moderator can view analytics', function () {
    $moderator = User::factory()->create();
    $moderator->roles()->attach(Role::where('name', 'moderator')->first());
    $token = $moderator->createToken('moderator-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/analytics');

    $response->assertOk();
});
