<?php

namespace Database\Factories\DataHub;

use App\Models\DataHub\DataSharingAgreement;
use App\Models\OAuth\App;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<DataSharingAgreement>
 */
class DataSharingAgreementFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'source_app_id' => App::factory(),
            'target_app_id' => App::factory(),
            'data_keys' => ['profile', 'email'],
            'consent_status' => 'granted',
            'granted_at' => now(),
            'revoked_at' => null,
        ];
    }

    public function revoked(): static
    {
        return $this->state(fn (array $attributes) => [
            'revoked_at' => now(),
        ]);
    }
}
