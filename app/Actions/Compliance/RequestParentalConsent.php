<?php

namespace App\Actions\Compliance;

use App\Models\Compliance\ParentalConsent;
use App\Models\User;
use App\Services\ComplianceService;

class RequestParentalConsent
{
    public function __construct(
        protected ComplianceService $complianceService,
    ) {}

    public function handle(User $user, string $parentEmail, ?string $parentName = null): ParentalConsent
    {
        return $this->complianceService->requestParentalConsent($user, $parentEmail, $parentName);
    }
}
