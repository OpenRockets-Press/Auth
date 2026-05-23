<?php

namespace Database\Factories\OAuth;

use App\Models\OAuth\App;
use App\Models\OAuth\AppScope;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AppScope>
 */
class AppScopeFactory extends Factory
{
    public function definition(): array
    {
        return [
            'app_id' => App::factory(),
            'name' => fake()->word(),
            'description' => fake()->sentence(),
            'is_required' => false,
        ];
    }

    public function required(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_required' => true,
        ]);
    }
}
