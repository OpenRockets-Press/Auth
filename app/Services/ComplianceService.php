<?php

namespace App\Services;

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

        $path = 'data-exports/'.$user->id.'/'.$request->id.'.json';
        $directory = dirname($path);

        if (! Storage::exists($directory)) {
            Storage::makeDirectory($directory);
        }

        Storage::put($path, json_encode($exportData, JSON_PRETTY_PRINT));

        $request->fulfill($path);

        return $path;
    }

    public function fulfillDataDeletion(DataAccessRequest $request): void
    {
        $user = $request->user;

        $userId = $user->id;
        $userName = $user->name;
        $userEmail = $user->email;

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

        $auditLogs = $user->auditLogs()->get()->toArray();
        $user->auditLogs()->delete();

        $user->delete();

        if (! empty($auditLogs)) {
            $deletionRecord = [
                'event_type' => 'compliance.data.deletion.executed',
                'event_data' => [
                    'deleted_user_id' => $userId,
                    'deleted_user_name' => $userName,
                    'deleted_user_email' => $userEmail,
                    'deletion_requested_at' => $request->created_at,
                    'deletion_fulfilled_at' => now(),
                    'audit_log_count' => count($auditLogs),
                ],
                'ip_address' => request()?->ip(),
                'created_at' => now(),
                'updated_at' => now(),
            ];

            \Illuminate\Support\Facades\DB::table('audit_logs')->insert($deletionRecord);
        }

        $request->fulfill();
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
                'event_data' => $l->event_data,
                'created_at' => $l->created_at,
            ]),
        ];
    }

    public function canUserProceed(User $user): bool
    {
        if (! $user->profile) {
            return true;
        }

        return $user->profile->hasConsent();
    }
}
