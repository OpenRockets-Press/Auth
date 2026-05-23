<?php

namespace App\Jobs;

use App\Models\Compliance\AuditLog;
use App\Models\Compliance\DataRetentionPolicy;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;

class ExpireOldData implements ShouldQueue
{
    use Queueable;

    public function handle(): void
    {
        $policies = DataRetentionPolicy::where('auto_delete', true)->get();

        foreach ($policies as $policy) {
            $cutoff = now()->subDays($policy->retention_days);

            match ($policy->data_type) {
                'audit_logs' => AuditLog::where('created_at', '<', $cutoff)->delete(),
                default => null,
            };
        }
    }
}
