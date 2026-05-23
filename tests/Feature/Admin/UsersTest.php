<?php

use App\Models\Admin\Role;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('admin can list users', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    User::factory()->count(5)->create();

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/users');

    $response->assertOk()
        ->assertJsonStructure([
            '*' => ['id', 'name', 'email', 'status'],
        ]);

    expect($response->json())->toHaveCount(6);
});

test('admin can filter users by status', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    User::factory()->count(3)->create(['status' => 'active']);
    User::factory()->count(2)->create(['status' => 'suspended']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/users?status=suspended');

    $response->assertOk();
    expect($response->json())->toHaveCount(2);
});

test('admin can search users by name or email', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    User::factory()->create(['name' => 'John Doe', 'email' => 'john@example.com']);
    User::factory()->create(['name' => 'Jane Smith', 'email' => 'jane@example.com']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/users?search=John');

    $response->assertOk();
    expect($response->json())->toHaveCount(1);
    expect($response->json('0.name'))->toBe('John Doe');
});

test('admin can view user details', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $user = User::factory()->create();

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/users/'.$user->id);

    $response->assertOk()
        ->assertJsonStructure(['id', 'name', 'email', 'status'])
        ->assertJson(['id' => $user->id]);
});

test('admin can suspend a user', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $user = User::factory()->create(['status' => 'active']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/users/'.$user->id.'/suspend');

    $response->assertOk()
        ->assertJson(['message' => 'User suspended.']);

    expect($user->fresh()->status)->toBe('suspended');
});

test('admin can unsuspend a user', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $user = User::factory()->create(['status' => 'suspended']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/users/'.$user->id.'/unsuspend');

    $response->assertOk()
        ->assertJson(['message' => 'User unsuspended.']);

    expect($user->fresh()->status)->toBe('active');
});

test('admin cannot suspend themselves', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/users/'.$admin->id.'/suspend');

    $response->assertForbidden();
});

test('non-admin cannot list users', function () {
    $user = User::factory()->create();
    $token = $user->createToken('user-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/users');

    $response->assertForbidden();
});

test('non-admin cannot suspend users', function () {
    $user = User::factory()->create();
    $otherUser = User::factory()->create();
    $token = $user->createToken('user-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/users/'.$otherUser->id.'/suspend');

    $response->assertForbidden();
});

test('moderator can suspend users', function () {
    $moderator = User::factory()->create();
    $moderator->roles()->attach(Role::where('name', 'moderator')->first());
    $token = $moderator->createToken('moderator-token');

    $user = User::factory()->create(['status' => 'active']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/users/'.$user->id.'/suspend');

    $response->assertOk()
        ->assertJson(['message' => 'User suspended.']);
});

test('unauthenticated admin requests return 401', function () {
    $this->getJson('/api/admin/users')->assertUnauthorized();
    $this->getJson('/api/admin/users/1')->assertUnauthorized();
    $this->postJson('/api/admin/users/1/suspend')->assertUnauthorized();
    $this->postJson('/api/admin/users/1/unsuspend')->assertUnauthorized();
});
