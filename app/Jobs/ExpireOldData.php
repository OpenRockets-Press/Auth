<?php

namespace App\Jobs;

use App\Models\Compliance\AuditLog;
use App\Models\Compliance\DataRetentionPolicy;
use App\Models\Compliance\ParentalConsent;
use App\Models\DataHub\DataAccessToken;
use App\Models\DataHub\DataRequest;
use App\Models\DataHub\DataSharingAgreement;
use App\Models\DataHub\UserDataStore;
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
                'parental_consents' => ParentalConsent::where('consent_status', '!=', 'pending')
                    ->where('created_at', '<', $cutoff)->delete(),
                'data_access_tokens' => DataAccessToken::where('expires_at', '<', $cutoff)->delete(),
                'data_requests' => DataRequest::where('status', '!=', 'pending')
                    ->where('created_at', '<', $cutoff)->delete(),
                'data_sharing_agreements' => DataSharingAgreement::whereNotNull('revoked_at')
                    ->where('revoked_at', '<', $cutoff)->delete(),
                'user_data_stores' => UserDataStore::where('updated_at', '<', $cutoff)->delete(),
                default => null,
            };
        }
    }
}
