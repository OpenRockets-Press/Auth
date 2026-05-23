<?php

namespace Database\Factories\Admin;

use App\Models\Admin\WebhookEndpoint;
use App\Models\OAuth\App;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WebhookEndpoint>
 */
class WebhookEndpointFactory extends Factory
{
    public function definition(): array
    {
        return [
            'app_id' => App::factory(),
            'url' => fake()->url(),
            'secret' => fake()->uuid(),
            'events' => ['*'],
            'is_active' => true,
        ];
    }

    public function inactive(): static
    {
        return $this->state(fn (array $attributes) => [
            'is_active' => false,
        ]);
    }
}
