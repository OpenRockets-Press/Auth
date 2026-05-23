<?php

use App\Models\Admin\Role;
use App\Models\OAuth\App;
use App\Models\User;
use Database\Seeders\RoleSeeder;

beforeEach(function () {
    $this->seed(RoleSeeder::class);
});

test('admin can list all apps', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    App::factory()->count(5)->create();

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/apps');

    $response->assertOk()
        ->assertJsonStructure([
            '*' => ['id', 'name', 'status'],
        ]);

    expect($response->json())->toHaveCount(5);
});

test('admin can filter apps by status', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    App::factory()->count(3)->create(['status' => 'pending']);
    App::factory()->count(2)->create(['status' => 'verified']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/apps?status=pending');

    $response->assertOk();
    expect($response->json())->toHaveCount(3);
});

test('admin can filter apps by category', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    App::factory()->count(3)->create(['category' => 'productivity']);
    App::factory()->count(2)->create(['category' => 'social']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->getJson('/api/admin/apps?category=productivity');

    $response->assertOk();
    expect($response->json())->toHaveCount(3);
});

test('admin can verify an app', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $app = App::factory()->create(['status' => 'pending']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/apps/'.$app->id.'/verify');

    $response->assertOk()
        ->assertJson([
            'status' => 'verified',
        ]);

    $freshApp = $app->fresh();
    expect($freshApp->status)->toBe('verified');
    expect($freshApp->verified_at)->not->toBeNull();
});

test('admin can reject an app', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $app = App::factory()->create(['status' => 'pending']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/apps/'.$app->id.'/reject');

    $response->assertOk()
        ->assertJson([
            'status' => 'rejected',
        ]);

    expect($app->fresh()->status)->toBe('rejected');
});

test('admin can suspend an app', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $app = App::factory()->verified()->create();

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/apps/'.$app->id.'/suspend');

    $response->assertOk()
        ->assertJson([
            'status' => 'suspended',
        ]);

    $freshApp = $app->fresh();
    expect($freshApp->status)->toBe('suspended');
    expect($freshApp->suspended_at)->not->toBeNull();
});

test('reviewer can verify apps', function () {
    $reviewer = User::factory()->create();
    $reviewer->roles()->attach(Role::where('name', 'reviewer')->first());
    $token = $reviewer->createToken('reviewer-token');

    $app = App::factory()->create(['status' => 'pending']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/apps/'.$app->id.'/verify');

    $response->assertOk()
        ->assertJson(['status' => 'verified']);
});

test('reviewer can reject apps', function () {
    $reviewer = User::factory()->create();
    $reviewer->roles()->attach(Role::where('name', 'reviewer')->first());
    $token = $reviewer->createToken('reviewer-token');

    $app = App::factory()->create(['status' => 'pending']);

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/apps/'.$app->id.'/reject');

    $response->assertOk()
        ->assertJson(['status' => 'rejected']);
});

test('non-admin cannot verify apps', function () {
    $user = User::factory()->create();
    $app = App::factory()->create(['status' => 'pending']);
    $token = $user->createToken('user-token');

    $response = $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/apps/'.$app->id.'/verify');

    $response->assertForbidden();
});

test('verifying app creates audit log', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $app = App::factory()->create(['status' => 'pending']);

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/apps/'.$app->id.'/verify');

    $this->assertDatabaseHas('audit_logs', [
        'event_type' => 'app.verified',
        'user_id' => $admin->id,
    ]);
});

test('suspending app creates audit log', function () {
    $admin = User::factory()->create();
    $admin->roles()->attach(Role::where('name', 'super_admin')->first());
    $token = $admin->createToken('admin-token');

    $app = App::factory()->verified()->create();

    $this->withHeaders(['Authorization' => 'Bearer '.$token->accessToken])
        ->postJson('/api/admin/apps/'.$app->id.'/suspend');

    $this->assertDatabaseHas('audit_logs', [
        'event_type' => 'app.suspended',
        'user_id' => $admin->id,
    ]);
});

test('unauthenticated admin app requests return 401', function () {
    $this->getJson('/api/admin/apps')->assertUnauthorized();
    $this->postJson('/api/admin/apps/1/verify')->assertUnauthorized();
    $this->postJson('/api/admin/apps/1/reject')->assertUnauthorized();
    $this->postJson('/api/admin/apps/1/suspend')->assertUnauthorized();
});
