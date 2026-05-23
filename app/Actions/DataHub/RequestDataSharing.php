<?php

namespace App\Actions\DataHub;

use App\Models\DataHub\DataRequest;
use App\Models\OAuth\App;
use App\Models\User;
use App\Services\DataHubService;

class RequestDataSharing
{
    public function __construct(
        protected DataHubService $dataHubService,
    ) {}

    public function handle(User $user, App $requestingApp, App $targetApp, array $dataKeys): DataRequest
    {
        return $this->dataHubService->requestDataSharing($user, $requestingApp, $targetApp, $dataKeys);
    }
}
