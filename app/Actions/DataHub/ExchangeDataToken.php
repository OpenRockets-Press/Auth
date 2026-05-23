<?php

namespace App\Actions\DataHub;

use App\Models\DataHub\DataAccessToken;
use App\Models\OAuth\App;
use App\Models\User;
use App\Services\DataHubService;

class ExchangeDataToken
{
    public function __construct(
        protected DataHubService $dataHubService,
    ) {}

    public function handle(User $user, App $requestingApp, App $grantingApp, array $scopes): DataAccessToken
    {
        return $this->dataHubService->exchangeToken($user, $requestingApp, $grantingApp, $scopes);
    }
}
