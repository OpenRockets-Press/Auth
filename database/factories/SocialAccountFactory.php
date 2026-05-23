<?php

namespace Database\Factories;

use App\Models\DataHub\SocialAccount;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<SocialAccount>
 */
class SocialAccountFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'provider' => fake()->randomElement(['google', 'github', 'facebook', 'twitter']),
            'provider_id' => fake()->uuid(),
            'access_token' => fake()->uuid(),
            'refresh_token' => fake()->uuid(),
            'token_expires_at' => now()->addHour(),
            'avatar_url' => fake()->imageUrl(),
            'email' => fake()->safeEmail(),
            'name' => fake()->name(),
            'linked_at' => now(),
        ];
    }
}
