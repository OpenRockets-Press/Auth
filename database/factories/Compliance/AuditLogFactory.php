<?php

namespace Database\Factories\Compliance;

use App\Models\Compliance\AuditLog;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<AuditLog>
 */
class AuditLogFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'event_type' => 'auth.login.success',
            'event_data' => ['method' => 'password'],
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'created_at' => now(),
        ];
    }

    public function loginFailed(): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type' => 'auth.login.failed',
        ]);
    }

    public function logout(): static
    {
        return $this->state(fn (array $attributes) => [
            'event_type' => 'auth.logout',
        ]);
    }
}
