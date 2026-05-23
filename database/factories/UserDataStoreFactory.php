<?php

namespace Database\Factories;

use App\Models\DataHub\UserDataStore;
use App\Models\OAuth\App;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<UserDataStore>
 */
class UserDataStoreFactory extends Factory
{
    public function definition(): array
    {
        return [
            'user_id' => User::factory(),
            'app_id' => App::factory(),
            'key' => fake()->word(),
            'value' => ['data' => fake()->sentence()],
        ];
    }
}
