<?php

namespace Database\Factories\DataHub;

use App\Models\DataHub\DataAccessToken;
use App\Models\OAuth\App;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;
use Illuminate\Support\Str;

/**
 * @extends Factory<DataAccessToken>
 */
class DataAccessTokenFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'requesting_app_id' => App::factory(),
            'granting_app_id' => App::factory(),
            'scopes' => ['read', 'write'],
            'token' => Str::random(64),
            'expires_at' => now()->addHour(),
        ];
    }

    public function expired(): static
    {
        return $this->state(fn (array $attributes) => [
            'expires_at' => now()->subHour(),
        ]);
    }
}
