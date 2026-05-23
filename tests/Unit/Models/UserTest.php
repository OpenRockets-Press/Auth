<?php

use App\Models\Admin\Role;
use App\Models\Compliance\UserProfile;
use App\Models\User;

test('isMinor returns true for users under 18', function () {
    $user = User::factory()->create();
    $user->profile()->create([
        'date_of_birth' => now()->subYears(15),
        'country_code' => 'US',
    ]);

    expect($user->fresh()->isMinor())->toBeTrue();
});

test('isMinor returns false for users 18 and over', function () {
    $user = User::factory()->create();
    $user->profile()->create([
        'date_of_birth' => now()->subYears(20),
        'country_code' => 'US',
    ]);

    expect($user->fresh()->isMinor())->toBeFalse();
});

test('isMinor returns false when profile is missing', function () {
    $user = User::factory()->create();

    expect($user->isMinor())->toBeFalse();
});

test('isMinor returns false when date_of_birth is null', function () {
    $user = User::factory()->create();
    $user->profile()->create([
        'date_of_birth' => null,
        'country_code' => 'US',
    ]);

    expect($user->fresh()->isMinor())->toBeFalse();
});

test('isLocked returns true when locked_until is in the future', function () {
    $user = User::factory()->locked()->create();

    expect($user->isLocked())->toBeTrue();
});

test('isLocked returns false when locked_until is in the past', function () {
    $user = User::factory()->create([
        'locked_until' => now()->subHour(),
    ]);

    expect($user->isLocked())->toBeFalse();
});

test('isLocked returns false when locked_until is null', function () {
    $user = User::factory()->create([
        'locked_until' => null,
    ]);

    expect($user->isLocked())->toBeFalse();
});

test('isAdmin returns true for super_admin role', function () {
    $user = User::factory()->create();
    $role = Role::factory()->superAdmin()->create();
    $user->roles()->attach($role);

    expect($user->fresh()->isAdmin())->toBeTrue();
});

test('isAdmin returns true for moderator role', function () {
    $user = User::factory()->create();
    $role = Role::factory()->moderator()->create();
    $user->roles()->attach($role);

    expect($user->fresh()->isAdmin())->toBeTrue();
});

test('isAdmin returns false for regular user', function () {
    $user = User::factory()->create();

    expect($user->isAdmin())->toBeFalse();
});

test('isAdmin returns false for custom role', function () {
    $user = User::factory()->create();
    $role = Role::factory()->create(['name' => 'custom_role']);
    $user->roles()->attach($role);

    expect($user->fresh()->isAdmin())->toBeFalse();
});

test('hasPermission returns true when role has permission', function () {
    $user = User::factory()->create();
    $role = Role::factory()->create([
        'permissions' => ['users.view', 'users.manage'],
    ]);
    $user->roles()->attach($role);

    expect($user->fresh()->hasPermission('users.view'))->toBeTrue();
});

test('hasPermission returns false when role does not have permission', function () {
    $user = User::factory()->create();
    $role = Role::factory()->create([
        'permissions' => ['users.view'],
    ]);
    $user->roles()->attach($role);

    expect($user->fresh()->hasPermission('users.delete'))->toBeFalse();
});

test('user has many apps relationship', function () {
    $user = User::factory()->hasApps(3)->create();

    expect($user->apps)->toHaveCount(3);
});

test('user has many consent records relationship', function () {
    $user = User::factory()->create();
    $app = \App\Models\OAuth\App::factory()->create();

    $user->consentRecords()->createMany([
        ['app_id' => $app->id, 'scopes' => ['profile'], 'granted_at' => now()],
        ['app_id' => $app->id, 'scopes' => ['email'], 'granted_at' => now()],
    ]);

    expect($user->consentRecords)->toHaveCount(2);
});

test('user has one profile relationship', function () {
    $user = User::factory()->hasProfile()->create();

    expect($user->profile)->not->toBeNull();
});

test('user has many social accounts relationship', function () {
    $user = User::factory()->hasSocialAccounts(2)->create();

    expect($user->socialAccounts)->toHaveCount(2);
});

test('user has many data stores relationship', function () {
    $user = User::factory()->hasDataStores(2)->create();

    expect($user->dataStores)->toHaveCount(2);
});

test('user has many roles relationship', function () {
    $user = User::factory()->create();
    $role1 = Role::factory()->create();
    $role2 = Role::factory()->create();
    $user->roles()->attach([$role1->id, $role2->id]);

    expect($user->fresh()->roles)->toHaveCount(2);
});
