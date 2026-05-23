<?php

namespace App\Actions\Compliance;

use App\Models\Compliance\ParentalConsent;
use App\Services\ComplianceService;

class RespondToParentalConsent
{
    public function __construct(
        protected ComplianceService $complianceService,
    ) {}

    public function handle(string $token, string $action): ParentalConsent
    {
        return $this->complianceService->respondToParentalConsent($token, $action);
    }
}
