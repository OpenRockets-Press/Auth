<?php

use App\Models\Compliance\Country;
use App\Models\Compliance\ParentalConsent;
use App\Models\Compliance\UserProfile;
use App\Models\User;
use Database\Seeders\CountrySeeder;

beforeEach(function () {
    $this->seed(CountrySeeder::class);
});

test('user profile calculates age correctly', function () {
    $user = User::factory()->create();
    $profile = UserProfile::factory()->create([
        'user_id' => $user->id,
        'date_of_birth' => now()->subYears(25),
    ]);

    expect($profile->age)->toBe(25);
});

test('user profile returns null age when date_of_birth is null', function () {
    $user = User::factory()->create();
    $profile = UserProfile::factory()->create([
        'user_id' => $user->id,
        'date_of_birth' => null,
    ]);

    expect($profile->age)->toBeNull();
});

test('user profile isMinor returns true for under 18', function () {
    $user = User::factory()->create();
    $profile = UserProfile::factory()->create([
        'user_id' => $user->id,
        'date_of_birth' => now()->subYears(15),
    ]);

    expect($profile->isMinor())->toBeTrue();
});

test('user profile isMinor returns false for 18 and over', function () {
    $user = User::factory()->create();
    $profile = UserProfile::factory()->create([
        'user_id' => $user->id,
        'date_of_birth' => now()->subYears(20),
    ]);

    expect($profile->isMinor())->toBeFalse();
});

test('user profile needsParentalConsent returns true for minors', function () {
    $user = User::factory()->create();
    $profile = UserProfile::factory()->create([
        'user_id' => $user->id,
        'date_of_birth' => now()->subYears(12),
        'country_code' => 'US',
    ]);

    expect($profile->needsParentalConsent())->toBeTrue();
});

test('user profile needsParentalConsent returns false for adults', function () {
    $user = User::factory()->create();
    $profile = UserProfile::factory()->create([
        'user_id' => $user->id,
        'date_of_birth' => now()->subYears(25),
        'country_code' => 'US',
    ]);

    expect($profile->needsParentalConsent())->toBeFalse();
});

test('user profile needsParentalConsent returns false without country', function () {
    $user = User::factory()->create();
    $profile = UserProfile::factory()->create([
        'user_id' => $user->id,
        'date_of_birth' => now()->subYears(12),
        'country_code' => null,
    ]);

    expect($profile->needsParentalConsent())->toBeFalse();
});

test('user profile hasConsent returns true when consent not required', function () {
    $user = User::factory()->create();
    $profile = UserProfile::factory()->create([
        'user_id' => $user->id,
        'parental_consent_required' => false,
    ]);

    expect($profile->hasConsent())->toBeTrue();
});

test('user profile hasConsent returns true when consent granted', function () {
    $user = User::factory()->create();
    $profile = UserProfile::factory()->create([
        'user_id' => $user->id,
        'parental_consent_required' => true,
        'parental_consent_status' => 'granted',
    ]);

    expect($profile->hasConsent())->toBeTrue();
});

test('user profile hasConsent returns false when consent pending', function () {
    $user = User::factory()->create();
    $profile = UserProfile::factory()->create([
        'user_id' => $user->id,
        'parental_consent_required' => true,
        'parental_consent_status' => 'pending',
    ]);

    expect($profile->hasConsent())->toBeFalse();
});

test('country requiresParentalConsent returns true for underage', function () {
    $country = Country::where('code', 'US')->first();

    expect($country->requiresParentalConsent(12))->toBeTrue();
});

test('country requiresParentalConsent returns false for adult', function () {
    $country = Country::where('code', 'US')->first();

    expect($country->requiresParentalConsent(18))->toBeFalse();
});

test('country isGDPRApplicable returns true for EU countries', function () {
    $country = Country::where('code', 'DE')->first();

    expect($country->isGDPRApplicable())->toBeTrue();
});

test('country isGDPRApplicable returns false for non-EU countries', function () {
    $country = Country::where('code', 'US')->first();

    expect($country->isGDPRApplicable())->toBeFalse();
});

test('country isCOPPAApplicable returns true for US', function () {
    $country = Country::where('code', 'US')->first();

    expect($country->isCOPPAApplicable())->toBeTrue();
});

test('country isCOPPAApplicable returns false for non-US countries', function () {
    $country = Country::where('code', 'DE')->first();

    expect($country->isCOPPAApplicable())->toBeFalse();
});

test('parental consent isGranted returns true when granted and not revoked', function () {
    $user = User::factory()->create();
    $consent = ParentalConsent::factory()->granted()->create(['user_id' => $user->id]);

    expect($consent->isGranted())->toBeTrue();
});

test('parental consent isGranted returns false when revoked', function () {
    $user = User::factory()->create();
    $consent = ParentalConsent::factory()->revoked()->create(['user_id' => $user->id]);

    expect($consent->isGranted())->toBeFalse();
});

test('parental consent isGranted returns false when pending', function () {
    $user = User::factory()->create();
    $consent = ParentalConsent::factory()->create(['user_id' => $user->id]);

    expect($consent->isGranted())->toBeFalse();
});

test('parental consent isPending returns true for pending consent', function () {
    $user = User::factory()->create();
    $consent = ParentalConsent::factory()->create(['user_id' => $user->id]);

    expect($consent->isPending())->toBeTrue();
});

test('parental consent isDenied returns true for denied consent', function () {
    $user = User::factory()->create();
    $consent = ParentalConsent::factory()->denied()->create(['user_id' => $user->id]);

    expect($consent->isDenied())->toBeTrue();
});

test('parental consent isRevoked returns true when revoked', function () {
    $user = User::factory()->create();
    $consent = ParentalConsent::factory()->revoked()->create(['user_id' => $user->id]);

    expect($consent->isRevoked())->toBeTrue();
});

test('parental consent grant method updates status', function () {
    $user = User::factory()->create();
    $consent = ParentalConsent::factory()->create(['user_id' => $user->id]);

    $consent->grant();

    expect($consent->consent_status)->toBe('granted');
    expect($consent->granted_at)->not->toBeNull();
});

test('parental consent deny method updates status', function () {
    $user = User::factory()->create();
    $consent = ParentalConsent::factory()->create(['user_id' => $user->id]);

    $consent->deny();

    expect($consent->consent_status)->toBe('denied');
});

test('parental consent revoke method sets revoked_at', function () {
    $user = User::factory()->create();
    $consent = ParentalConsent::factory()->granted()->create(['user_id' => $user->id]);

    $consent->revoke();

    expect($consent->revoked_at)->not->toBeNull();
});
