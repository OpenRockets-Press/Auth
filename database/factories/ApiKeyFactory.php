<?php

namespace Database\Factories;

use App\Models\Admin\ApiKey;
use App\Models\OAuth\App;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<ApiKey>
 */
class ApiKeyFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'app_id' => App::factory(),
            'name' => fake()->word(),
            'key_hash' => hash('sha256', fake()->uuid()),
            'scopes' => ['read'],
            'expires_at' => now()->addYear(),
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->subDay(),
        ]);
    }
}
