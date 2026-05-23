<?php

namespace Database\Factories;

use App\Models\OAuth\App;
use App\Models\OAuth\ConsentRecord;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ConsentRecord>
 */
class ConsentRecordFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'app_id' => App::factory(),
            'scopes' => ['profile', 'email'],
            'consent_method' => 'oauth_screen',
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'granted_at' => now(),
            'revoked_at' => null,
        ];
    }

    public function revoked(): static
    {
        return $this->state(fn (array $attributes) => [
            'revoked_at' => now(),
        ]);
    }
}
