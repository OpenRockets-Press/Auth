<?php

namespace Database\Factories;

use App\Models\Admin\Role;
use Illuminate\Database\Eloquent\Factories\Factory;

/**
 * @extends Factory<Role>
 */
class RoleFactory extends Factory
{
    public function definition(): array
    {
        return [
            'name' => fake()->unique()->word(),
            'description' => fake()->sentence(),
            'permissions' => [],
        ];
    }

    public function superAdmin(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'super_admin',
            'description' => 'Full system access',
            'permissions' => [
                'users.view', 'users.manage', 'users.suspend', 'users.delete', 'users.impersonate',
                'apps.view', 'apps.manage', 'apps.verify', 'apps.reject', 'apps.suspend',
                'audit_logs.view', 'audit_logs.export',
                'data_requests.view', 'data_requests.manage',
                'countries.manage', 'analytics.view', 'system.configure',
            ],
        ]);
    }

    public function moderator(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'moderator',
            'description' => 'Content and user moderation',
            'permissions' => [
                'users.view', 'users.suspend',
                'apps.view', 'apps.verify', 'apps.reject', 'apps.suspend',
                'audit_logs.view', 'data_requests.view', 'data_requests.manage',
                'analytics.view',
            ],
        ]);
    }

    public function reviewer(): static
    {
        return $this->state(fn (array $attributes) => [
            'name' => 'reviewer',
            'description' => 'App review queue management',
            'permissions' => [
                'apps.view', 'apps.verify', 'apps.reject', 'audit_logs.view',
            ],
        ]);
    }
}
