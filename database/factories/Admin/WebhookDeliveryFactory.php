<?php

namespace Database\Factories\Admin;

use App\Models\Admin\WebhookDelivery;
use App\Models\Admin\WebhookEndpoint;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<WebhookDelivery>
 */
class WebhookDeliveryFactory extends Factory
{
    public function definition(): array
    {
        return [
            'webhook_endpoint_id' => WebhookEndpoint::factory(),
            'event_type' => 'auth.login.success',
            'payload' => ['user_id' => 1],
            'status' => 'pending',
            'attempts' => 0,
        ];
    }

    public function delivered(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'delivered',
            'response_code' => 200,
            'attempts' => 1,
            'last_attempt_at' => now(),
        ]);
    }

    public function failed(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'failed',
            'response_code' => 500,
            'attempts' => 5,
            'last_attempt_at' => now(),
        ]);
    }
}
