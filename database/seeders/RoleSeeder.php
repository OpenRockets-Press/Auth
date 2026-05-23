<?php

namespace Database\Seeders;

use App\Models\Admin\Role;
use Illuminate\Database\Seeder;

class RoleSeeder extends Seeder
{
    public function run(): void
    {
        $roles = [
            [
                'name' => 'super_admin',
                'description' => 'Full system access',
                'permissions' => [
                    'users.view',
                    'users.manage',
                    'users.suspend',
                    'users.delete',
                    'users.impersonate',
                    'apps.view',
                    'apps.manage',
                    'apps.verify',
                    'apps.reject',
                    'apps.suspend',
                    'audit_logs.view',
                    'audit_logs.export',
                    'data_requests.view',
                    'data_requests.manage',
                    'countries.manage',
                    'analytics.view',
                    'system.configure',
                ],
            ],
            [
                'name' => 'moderator',
                'description' => 'Content and user moderation',
                'permissions' => [
                    'users.view',
                    'users.suspend',
                    'apps.view',
                    'apps.verify',
                    'apps.reject',
                    'apps.suspend',
                    'audit_logs.view',
                    'data_requests.view',
                    'data_requests.manage',
                    'analytics.view',
                ],
            ],
            [
                'name' => 'reviewer',
                'description' => 'App review queue management',
                'permissions' => [
                    'apps.view',
                    'apps.verify',
                    'apps.reject',
                    'audit_logs.view',
                ],
            ],
        ];

        foreach ($roles as $role) {
            Role::updateOrCreate(
                ['name' => $role['name']],
                $role
            );
        }
    }
}
