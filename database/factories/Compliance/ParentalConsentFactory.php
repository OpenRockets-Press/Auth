<?php

namespace Database\Factories\Compliance;

use App\Models\Compliance\ParentalConsent;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ParentalConsent>
 */
class ParentalConsentFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'parent_email' => fake()->safeEmail(),
            'parent_name' => fake()->name(),
            'consent_method' => 'email',
            'consent_status' => 'pending',
            'verification_token' => fake()->uuid(),
            'ip_address' => fake()->ipv4(),
        ];
    }

    public function granted(): static
    {
        return $this->state(fn (array $attributes) => [
            'consent_status' => 'granted',
            'granted_at' => now(),
        ]);
    }

    public function denied(): static
    {
        return $this->state(fn (array $attributes) => [
            'consent_status' => 'denied',
        ]);
    }

    public function revoked(): static
    {
        return $this->state(fn (array $attributes) => [
            'consent_status' => 'granted',
            'granted_at' => now(),
            'revoked_at' => now(),
        ]);
    }
}
