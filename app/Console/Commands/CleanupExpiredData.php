<?php

namespace App\Console\Commands;

use App\Models\Compliance\AuditLog;
use App\Models\Compliance\ParentalConsent;
use App\Models\DataHub\DataAccessToken;
use Illuminate\Console\Command;

class CleanupExpiredData extends Command
{
    protected $signature = 'auth:cleanup {--dry-run : Show what would be deleted without actually deleting}';

    protected $description = 'Clean up expired and old data based on retention policies';

    public function handle(): int
    {
        $this->info('Starting data cleanup...');

        if ($this->option('dry-run')) {
            $this->warn('DRY RUN MODE - No data will be deleted.');
        }

        $this->cleanupExpiredTokens();
        $this->cleanupOldAuditLogs();
        $this->cleanupExpiredConsentTokens();

        $this->info('Data cleanup completed.');

        return self::SUCCESS;
    }

    protected function cleanupExpiredTokens(): void
    {
        $count = DataAccessToken::where('expires_at', '<', now())->count();

        if ($count === 0) {
            $this->info('No expired data access tokens to clean up.');

            return;
        }

        $this->info("Found {$count} expired data access tokens.");

        if (! $this->option('dry-run')) {
            DataAccessToken::where('expires_at', '<', now())->delete();
            $this->info("Deleted {$count} expired data access tokens.");
        }
    }

    protected function cleanupOldAuditLogs(): void
    {
        $retentionDays = config('auth-system.audit.retention_days', 365);
        $cutoff = now()->subDays($retentionDays);

        $count = AuditLog::where('created_at', '<', $cutoff)->count();

        if ($count === 0) {
            $this->info('No old audit logs to clean up.');

            return;
        }

        $this->info("Found {$count} audit logs older than {$retentionDays} days.");

        if (! $this->option('dry-run')) {
            AuditLog::where('created_at', '<', $cutoff)->delete();
            $this->info("Deleted {$count} old audit logs.");
        }
    }

    protected function cleanupExpiredConsentTokens(): void
    {
        $lifetimeHours = config('auth-system.parental_consent.token_lifetime_hours', 48);
        $cutoff = now()->subHours($lifetimeHours);

        $count = ParentalConsent::where('consent_status', 'pending')
            ->where('created_at', '<', $cutoff)
            ->count();

        if ($count === 0) {
            $this->info('No expired parental consent tokens to clean up.');

            return;
        }

        $this->info("Found {$count} expired parental consent tokens.");

        if (! $this->option('dry-run')) {
            ParentalConsent::where('consent_status', 'pending')
                ->where('created_at', '<', $cutoff)
                ->delete();

            $this->info("Deleted {$count} expired parental consent tokens.");
        }
    }
}
