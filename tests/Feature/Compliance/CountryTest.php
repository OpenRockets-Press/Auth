<?php

use Database\Seeders\CountrySeeder;

beforeEach(function () {
    $this->seed(CountrySeeder::class);
});

test('can get country by code', function () {
    $response = $this->getJson('/api/compliance/country/US');

    $response->assertOk()
        ->assertJsonStructure([
            'code', 'name', 'age_of_digital_consent', 'gdpr_applicable', 'coppa_applicable',
        ])
        ->assertJson([
            'code' => 'US',
            'name' => 'United States',
        ]);
});

test('can list all countries', function () {
    $response = $this->getJson('/api/compliance/countries');

    $response->assertOk()
        ->assertJsonStructure([
            '*' => ['code', 'name', 'age_of_digital_consent'],
        ]);

    expect($response->json())->toHaveCount(30);
});

test('returns 404 for non-existent country', function () {
    $response = $this->getJson('/api/compliance/country/XX');

    $response->assertNotFound();
});

test('country includes parental consent age', function () {
    $response = $this->getJson('/api/compliance/country/DE');

    $response->assertOk()
        ->assertJson([
            'code' => 'DE',
            'requires_parental_consent_below_age' => 16,
        ]);
});

test('GDPR countries are marked correctly', function () {
    $response = $this->getJson('/api/compliance/country/FR');

    $response->assertOk()
        ->assertJson([
            'gdpr_applicable' => true,
        ]);
});

test('non-GDPR countries are marked correctly', function () {
    $response = $this->getJson('/api/compliance/country/US');

    $response->assertOk()
        ->assertJson([
            'gdpr_applicable' => false,
        ]);
});

test('COPPA countries are marked correctly', function () {
    $response = $this->getJson('/api/compliance/country/US');

    $response->assertOk()
        ->assertJson([
            'coppa_applicable' => true,
        ]);
});

test('countries are ordered by name', function () {
    $response = $this->getJson('/api/compliance/countries');

    $response->assertOk();
    $countries = $response->json();

    $names = array_map(fn ($c) => $c['name'], $countries);
    $sorted = $names;
    sort($sorted);

    expect($names)->toBe($sorted);
});
