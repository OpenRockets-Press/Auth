<?php

namespace App\Actions\DataHub;

use App\Models\DataHub\UserDataStore;
use App\Models\OAuth\App;
use App\Models\User;
use App\Services\DataHubService;

class StoreUserData
{
    public function __construct(
        protected DataHubService $dataHubService,
    ) {}

    public function handle(User $user, App $app, string $key, mixed $value): UserDataStore
    {
        return $this->dataHubService->storeData($user, $app, $key, $value);
    }
}
