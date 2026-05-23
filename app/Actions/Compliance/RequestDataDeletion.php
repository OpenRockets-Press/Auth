<?php

namespace App\Actions\Compliance;

use App\Models\Compliance\DataAccessRequest;
use App\Models\User;
use App\Services\ComplianceService;

class RequestDataDeletion
{
    public function __construct(
        protected ComplianceService $complianceService,
    ) {}

    public function handle(User $user): DataAccessRequest
    {
        return $this->complianceService->requestDataDeletion($user);
    }
}
