<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Laravel\Passport\ClientRepository;

class PassportClientSeeder extends Seeder
{
    public function run(): void
    {
        $repository = app(ClientRepository::class);

        $repository->createPersonalAccessGrantClient(
            'Personal Access Client',
            'users'
        );

        $repository->createPasswordGrantClient(
            'Password Grant Client',
            'users'
        );
    }
}
