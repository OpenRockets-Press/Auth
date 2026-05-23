<?php

namespace Database\Factories;

use App\Models\Compliance\UserProfile;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserProfile>
 */
class UserProfileFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'date_of_birth' => fake()->dateTimeBetween('-50 years', '-18 years'),
            'country_code' => 'US',
            'age_verified' => true,
            'age_verification_method' => 'self_declared',
            'parental_consent_required' => false,
            'parental_consent_status' => 'not_required',
        ];
    }

    public function minor(): static
    {
        return $this->state(fn (array $attributes) => [
            'date_of_birth' => now()->subYears(15),
            'parental_consent_required' => true,
            'parental_consent_status' => 'pending',
        ]);
    }

    public function withConsent(): static
    {
        return $this->state(fn (array $attributes) => [
            'date_of_birth' => now()->subYears(15),
            'parental_consent_required' => true,
            'parental_consent_status' => 'granted',
        ]);
    }
}
