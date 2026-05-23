<?php

namespace Database\Factories\DataHub;

use App\Models\DataHub\DataRequest;
use App\Models\OAuth\App;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DataRequest>
 */
class DataRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'requesting_app_id' => App::factory(),
            'target_app_id' => App::factory(),
            'data_keys' => ['profile', 'email'],
            'status' => 'pending',
            'user_consent_status' => 'pending',
        ];
    }

    public function approved(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'approved',
        ]);
    }

    public function denied(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'denied',
        ]);
    }
}
