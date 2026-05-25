<?php

namespace App\Services;

use App\Events\Compliance\DataDeletionFulfilled;
use App\Events\Compliance\DataExportFulfilled;
use App\Exceptions\Compliance\InvalidConsentTokenException;
use App\Models\Compliance\Country;
use App\Models\Compliance\DataAccessRequest;
use App\Models\Compliance\ParentalConsent;
use App\Models\Compliance\UserProfile;
use App\Models\User;
use Carbon\Carbon;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Str;

class ComplianceService
{
    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function evaluateUserProfile(User $user, string $countryCode, string $dateOfBirth): UserProfile
    {
        $country = Country::findOrFail($countryCode);
        $dob = Carbon::parse($dateOfBirth);
        $age = $dob->diffInYears(now());
        $needsConsent = $country->requiresParentalConsent($age);

        $profile = $user->profile ?? new UserProfile;
        $profile->user_id = $user->id;
        $profile->date_of_birth = $dob;
        $profile->country_code = $countryCode;
        $profile->age_verified = true;
        $profile->age_verification_method = 'self_declared';
        $profile->parental_consent_required = $needsConsent;
        $profile->parental_consent_status = $needsConsent ? 'pending' : 'not_required';
        $profile->save();

        return $profile;
    }

    public function requestParentalConsent(User $user, string $parentEmail, ?string $parentName = null): ParentalConsent
    {
        $token = Str::random(64);
        $lifetimeHours = config('auth-system.parental_consent.token_lifetime_hours', 48);

        $consent = ParentalConsent::create([
            'user_id' => $user->id,
            'parent_email' => $parentEmail,
            'parent_name' => $parentName,
            'consent_method' => 'email',
            'consent_status' => 'pending',
            'verification_token' => $token,
            'ip_address' => request()?->ip(),
        ]);

        $user->profile?->update(['parental_consent_status' => 'pending']);

        $this->auditService->logParentalConsentRequested($user, $parentEmail);

        return $consent;
    }

    public function respondToParentalConsent(string $token, string $action): ParentalConsent
    {
        $consent = ParentalConsent::where('verification_token', $token)
            ->where('consent_status', 'pending')
            ->firstOrFail();

        if ($consent->created_at->addHours(config('auth-system.parental_consent.token_lifetime_hours', 48))->isPast()) {
            throw new InvalidConsentTokenException;
        }

        if ($action === 'grant') {
            $consent->grant();
            $consent->user->profile?->update(['parental_consent_status' => 'granted']);
            $this->auditService->logParentalConsentGranted($consent->user);
        } elseif ($action === 'deny') {
            $consent->deny();
            $consent->user->profile?->update(['parental_consent_status' => 'denied']);
        }

        return $consent;
    }

    public function requestDataExport(User $user): DataAccessRequest
    {
        $request = DataAccessRequest::create([
            'user_id' => $user->id,
            'request_type' => 'export',
            'status' => 'pending',
            'requested_by' => 'user',
        ]);

        $this->auditService->logDataExportRequested($user);

        return $request;
    }

    public function requestDataDeletion(User $user): DataAccessRequest
    {
        $request = DataAccessRequest::create([
            'user_id' => $user->id,
            'request_type' => 'deletion',
            'status' => 'pending',
            'requested_by' => 'user',
        ]);

        $this->auditService->logDataDeletionRequested($user);

        return $request;
    }

    public function fulfillDataExport(DataAccessRequest $request): string
    {
        $user = $request->user;
        $exportData = $this->compileUserData($user);

        $safeUserId = preg_replace('/[^0-9]/', '', (string) $user->id);
        $safeRequestId = preg_replace('/[^0-9]/', '', (string) $request->id);

        $path = 'data-exports/'.$safeUserId.'/'.$safeRequestId.'.json';
        $directory = dirname($path);

        if (! Storage::exists($directory)) {
            Storage::makeDirectory($directory);
        }

        Storage::put($path, json_encode($exportData, JSON_PRETTY_PRINT | JSON_UNESCAPED_SLASHES));

        $request->fulfill($path);

        $downloadUrl = route('compliance.data-export.download-file', ['dataRequest' => $request->id]);

        event(new DataExportFulfilled($request, $downloadUrl));

        return $path;
    }

    public function fulfillDataDeletion(DataAccessRequest $request): void
    {
        $user = $request->user;

        $userId = $user->id;
        $userEmailHash = hash('sha256', $user->email);

        $user->tokens()->delete();
        $user->consentRecords()->delete();
        $user->dataStores()->delete();
        $user->socialAccounts()->delete();
        $user->trustedDevices()->delete();
        $user->apiKeys()->delete();
        $user->dataAccessRequests()->where('id', '!=', $request->id)->delete();
        $user->dataSharingAgreements()->delete();
        $user->dataAccessTokens()->delete();
        $user->dataRequests()->where('id', '!=', $request->id)->delete();
        $user->parentalConsents()->delete();
        $user->profile?->delete();

        $auditLogCount = $user->auditLogs()->count();
        $user->auditLogs()->delete();

        $user->delete();

        if ($auditLogCount > 0) {
            $deletionRecord = [
                'event_type' => 'compliance.data.deletion.executed',
                'event_data' => [
                    'deleted_user_id' => $userId,
                    'deleted_user_email_hash' => $userEmailHash,
                    'deletion_requested_at' => $request->created_at,
                    'deletion_fulfilled_at' => now(),
                    'audit_log_count' => $auditLogCount,
                ],
                'ip_address' => request()?->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            \Illuminate\Support\Facades\DB::table('audit_logs')->insert($deletionRecord);
        }

        $request->fulfill();

        event(new DataDeletionFulfilled($request));
    }

    public function compileUserData(User $user): array
    {
        return [
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'created_at' => $user->created_at,
                'updated_at' => $user->updated_at,
            ],
            'profile' => $user->profile?->only(['date_of_birth', 'country_code', 'age_verified']),
            'consents' => $user->consentRecords()->get()->map(fn ($c) => [
                'app_id' => $c->app_id,
                'app_name' => $c->app->name,
                'scopes' => $c->scopes,
                'granted_at' => $c->granted_at,
                'revoked_at' => $c->revoked_at,
            ]),
            'social_accounts' => $user->socialAccounts()->get()->map(fn ($s) => [
                'provider' => $s->provider,
                'email' => $s->email,
                'name' => $s->name,
                'linked_at' => $s->linked_at,
            ]),
            'data_stores' => $user->dataStores()->get()->map(fn ($d) => [
                'app_id' => $d->app_id,
                'app_name' => $d->app?->name,
                'key' => $d->key,
                'value' => $d->value,
                'created_at' => $d->created_at,
                'updated_at' => $d->updated_at,
            ]),
            'data_sharing_agreements' => $user->dataSharingAgreements()->get()->map(fn ($a) => [
                'source_app_id' => $a->source_app_id,
                'source_app_name' => $a->sourceApp?->name,
                'target_app_id' => $a->target_app_id,
                'target_app_name' => $a->targetApp?->name,
                'data_keys' => $a->data_keys,
                'consent_status' => $a->consent_status,
                'granted_at' => $a->granted_at,
                'revoked_at' => $a->revoked_at,
            ]),
            'audit_logs' => $user->auditLogs()->get()->map(fn ($l) => [
                'event_type' => $l->event_type,
                'event_data' => $this->sanitizeAuditData($l->event_data),
                'ip_address' => $l->ip_address,
                'created_at' => $l->created_at,
            ]),
        ];
    }

    protected function sanitizeAuditData(?array $data): array
    {
        if (! $data) {
            return [];
        }

        $sensitiveKeys = ['password', 'token', 'secret', 'access_token', 'refresh_token', 'client_secret', 'authorization_code'];

        $sanitize = function ($value, $key) use (&$sanitize, $sensitiveKeys) {
            if (is_array($value)) {
                return array_map(fn ($v, $k) => $sanitize($v, $k), $value, array_keys($value));
            }

            if (in_array(strtolower((string) $key), $sensitiveKeys, true)) {
                return '[redacted]';
            }

            return $value;
        };

        return array_map(fn ($value, $key) => $sanitize($value, $key), $data, array_keys($data));
    }

    public function canUserProceed(User $user): bool
    {
        if (! $user->profile) {
            return true;
        }

        return $user->profile->hasConsent();
    }
}
