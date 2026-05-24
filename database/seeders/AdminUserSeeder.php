<?php

namespace Database\Seeders;

use App\Models\Admin\Role;
use App\Models\User;
use Illuminate\Database\Seeder;

class AdminUserSeeder extends Seeder
{
    public function run(): void
    {
        $superAdminRole = Role::where('name', 'super_admin')->first();

        if (! $superAdminRole) {
            return;
        }

        $admin = User::firstOrCreate(
            ['email' => 'admin@example.com'],
            [
                'name' => 'Admin User',
                'password' => bcrypt('password'),
                'email_verified_at' => now(),
                'status' => 'active',
            ],
        );

        if (! $admin->roles()->where('name', 'super_admin')->exists()) {
            $admin->roles()->attach($superAdminRole);
        }
    }
}
