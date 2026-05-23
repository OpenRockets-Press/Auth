<?php

use App\Models\OAuth\App;
use App\Models\User;

test('isVerified returns true for verified apps', function () {
    $app = App::factory()->verified()->create();

    expect($app->isVerified())->toBeTrue();
});

test('isVerified returns true for system apps', function () {
    $app = App::factory()->system()->create();

    expect($app->isVerified())->toBeTrue();
});

test('isVerified returns false for pending apps', function () {
    $app = App::factory()->create(['status' => 'pending']);

    expect($app->isVerified())->toBeFalse();
});

test('isVerified returns false for rejected apps', function () {
    $app = App::factory()->rejected()->create();

    expect($app->isVerified())->toBeFalse();
});

test('isSuspended returns true for suspended apps', function () {
    $app = App::factory()->suspended()->create();

    expect($app->isSuspended())->toBeTrue();
});

test('isSuspended returns true when suspended_at is set', function () {
    $app = App::factory()->create([
        'status' => 'pending',
        'suspended_at' => now(),
    ]);

    expect($app->isSuspended())->toBeTrue();
});

test('isSuspended returns false for active apps', function () {
    $app = App::factory()->verified()->create();

    expect($app->isSuspended())->toBeFalse();
});

test('isActive returns true for verified apps', function () {
    $app = App::factory()->verified()->create();

    expect($app->isActive())->toBeTrue();
});

test('isActive returns true for pending apps', function () {
    $app = App::factory()->create(['status' => 'pending']);

    expect($app->isActive())->toBeTrue();
});

test('isActive returns false for suspended apps', function () {
    $app = App::factory()->suspended()->create();

    expect($app->isActive())->toBeFalse();
});

test('isActive returns false for rejected apps', function () {
    $app = App::factory()->rejected()->create();

    expect($app->isActive())->toBeFalse();
});

test('app belongs to owner', function () {
    $owner = User::factory()->create();
    $app = App::factory()->create(['owner_id' => $owner->id]);

    expect($app->owner->id)->toBe($owner->id);
});

test('app has many scopes relationship', function () {
    $app = App::factory()->hasAppScopes(3)->create();

    expect($app->scopes)->toHaveCount(3);
});

test('app has many consent records relationship', function () {
    $app = App::factory()->create();
    $user = User::factory()->create();

    $app->consentRecords()->create([
        'user_id' => $user->id,
        'scopes' => ['profile'],
        'granted_at' => now(),
    ]);

    expect($app->consentRecords)->toHaveCount(1);
});

test('app has fillable attributes', function () {
    $app = new App;

    expect($app->getFillable())->toContain(
        'owner_id',
        'client_id',
        'name',
        'description',
        'status',
        'redirect_uris',
    );
});

test('app casts redirect_uris as array', function () {
    $app = App::factory()->create([
        'redirect_uris' => ['https://example.com/callback'],
    ]);

    expect($app->redirect_uris)->toBeArray();
    expect($app->redirect_uris)->toContain('https://example.com/callback');
});

test('app casts verified_at as datetime', function () {
    $app = App::factory()->verified()->create();

    expect($app->verified_at)->toBeInstanceOf(\Carbon\CarbonImmutable::class);
});

test('app casts suspended_at as datetime', function () {
    $app = App::factory()->suspended()->create();

    expect($app->suspended_at)->toBeInstanceOf(\Carbon\CarbonImmutable::class);
});
