<?php

namespace Database\Factories;

use App\Models\Compliance\DataAccessRequest;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DataAccessRequest>
 */
class DataAccessRequestFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'request_type' => 'export',
            'status' => 'pending',
            'requested_by' => 'user',
        ];
    }

    public function deletion(): static
    {
        return $this->state(fn (array $attributes) => [
            'request_type' => 'deletion',
        ]);
    }

    public function fulfilled(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'fulfilled',
            'fulfilled_at' => now(),
        ]);
    }

    public function rejected(): static
    {
        return $this->state(fn (array $attributes) => [
            'status' => 'rejected',
        ]);
    }
}
