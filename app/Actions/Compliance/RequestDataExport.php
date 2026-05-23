<?php

namespace App\Actions\Compliance;

use App\Models\Compliance\DataAccessRequest;
use App\Models\User;
use App\Services\ComplianceService;

class RequestDataExport
{
    public function __construct(
        protected ComplianceService $complianceService,
    ) {}

    public function handle(User $user): DataAccessRequest
    {
        return $this->complianceService->requestDataExport($user);
    }
}
