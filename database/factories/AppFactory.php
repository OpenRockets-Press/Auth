<?php

namespace Database\Factories;

use App\Models\OAuth\App;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<App>
 */
class AppFactory extends Factory
{
    public function definition(): array
    {
        return [
            'owner_id' => User::factory(),
            'client_id' => null,
            'name' => fake()->company(),
            'description' => fake()->sentence(),
            'icon_url' => fake()->imageUrl(),
            'status' => 'pending',
            'is_system' => false,
            'redirect_uris' => [fake()->url()],
            'homepage_url' => fake()->url(),
            'privacy_policy_url' => fake()->url(),
            'terms_url' => fake()->url(),
            'category' => fake()->randomElement(['productivity', 'social', 'finance', 'health']),
        ];
    }

    public function verified(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'verified',
            'verified_at' => now(),
        ]);
    }

    public function suspended(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'suspended',
            'suspended_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
        ]);
    }

    public function system(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_system' => true,
            'status' => 'verified',
        ]);
    }
}
