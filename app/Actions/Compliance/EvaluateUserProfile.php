<?php

namespace App\Actions\Compliance;

use App\Models\Compliance\UserProfile;
use App\Models\User;
use App\Services\ComplianceService;

class EvaluateUserProfile
{
    public function __construct(
        protected ComplianceService $complianceService,
    ) {}

    public function handle(User $user, string $countryCode, string $dateOfBirth): UserProfile
    {
        return $this->complianceService->evaluateUserProfile($user, $countryCode, $dateOfBirth);
    }
}
