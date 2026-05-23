<?php

namespace App\Jobs;

use App\Models\Compliance\DataAccessRequest;
use App\Services\ComplianceService;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class FulfillDataDeletion implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public DataAccessRequest $request,
    ) {}

    public function handle(ComplianceService $complianceService): void
    {
        $complianceService->fulfillDataDeletion($this->request);
    }
}
