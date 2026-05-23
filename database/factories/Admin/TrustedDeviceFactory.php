<?php

namespace Database\Factories\Admin;

use App\Models\Admin\TrustedDevice;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<TrustedDevice>
 */
class TrustedDeviceFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'device_fingerprint' => hash('sha256', fake()->userAgent()),
            'device_name' => fake()->word(),
            'ip_address' => fake()->ipv4(),
            'user_agent' => fake()->userAgent(),
            'trusted_at' => now(),
            'last_used_at' => now(),
        ];
    }
}
