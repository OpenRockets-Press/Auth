<?php

namespace Database\Factories;

use App\Models\Compliance\Country;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Country>
 */
class CountryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'code' => fake()->unique()->countryCode(),
            'name' => fake()->country(),
            'age_of_digital_consent' => 16,
            'gdpr_applicable' => false,
            'coppa_applicable' => false,
            'data_retention_days' => 365,
            'requires_parental_consent_below_age' => 16,
        ];
    }
}
