<?php

namespace App\Services;

use App\Models\DataHub\DataAccessToken;
use App\Models\DataHub\DataRequest;
use App\Models\DataHub\DataSharingAgreement;
use App\Models\DataHub\UserDataStore;
use App\Models\OAuth\App;
use App\Models\User;
use Illuminate\Support\Str;

class DataHubService
{
    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function storeData(User $user, App $app, string $key, mixed $value): UserDataStore
    {
        $store = UserDataStore::updateOrCreate(
            ['user_id' => $user->id, 'app_id' => $app->id, 'key' => $key],
            ['value' => $value]
        );

        $this->auditService->logDataHubStore($user, $app, $key);

        return $store;
    }

    public function getData(User $user, App $app, string $key, mixed $default = null): mixed
    {
        $store = UserDataStore::where('user_id', $user->id)
            ->where('app_id', $app->id)
            ->where('key', $key)
            ->first();

        if (! $store) {
            return $default;
        }

        return $store->value;
    }

    public function getAllData(User $user, App $app): array
    {
        return UserDataStore::where('user_id', $user->id)
            ->where('app_id', $app->id)
            ->get()
            ->pluck('value', 'key')
            ->toArray();
    }

    public function deleteData(User $user, App $app, string $key): bool
    {
        return UserDataStore::where('user_id', $user->id)
            ->where('app_id', $app->id)
            ->where('key', $key)
            ->delete() > 0;
    }

    public function deleteAllData(User $user, App $app): void
    {
        UserDataStore::where('user_id', $user->id)
            ->where('app_id', $app->id)
            ->delete();
    }

    public function requestDataSharing(User $user, App $requestingApp, App $targetApp, array $dataKeys): DataRequest
    {
        $request = DataRequest::create([
            'user_id' => $user->id,
            'requesting_app_id' => $requestingApp->id,
            'target_app_id' => $targetApp->id,
            'data_keys' => $dataKeys,
            'status' => 'pending',
            'user_consent_status' => 'pending',
        ]);

        return $request;
    }

    public function grantDataSharingConsent(DataRequest $request): DataSharingAgreement
    {
        $agreement = DataSharingAgreement::create([
            'user_id' => $request->user_id,
            'source_app_id' => $request->target_app_id,
            'target_app_id' => $request->requesting_app_id,
            'data_keys' => $request->data_keys,
            'consent_status' => 'granted',
            'granted_at' => now(),
        ]);

        $request->consentGranted();

        return $agreement;
    }

    public function denyDataSharingConsent(DataRequest $request): void
    {
        $request->consentDenied();
    }

    public function exchangeToken(User $user, App $requestingApp, App $grantingApp, array $scopes): DataAccessToken
    {
        $agreement = DataSharingAgreement::where('user_id', $user->id)
            ->where('source_app_id', $grantingApp->id)
            ->where('target_app_id', $requestingApp->id)
            ->where('consent_status', 'granted')
            ->whereNull('revoked_at')
            ->first();

        if (! $agreement) {
            throw new \RuntimeException('No active data sharing agreement exists.');
        }

        $token = Str::random(64);
        $lifetimeMinutes = config('auth-system.data_hub.token_lifetime_minutes', 60);

        return DataAccessToken::create([
            'user_id' => $user->id,
            'requesting_app_id' => $requestingApp->id,
            'granting_app_id' => $grantingApp->id,
            'scopes' => $scopes,
            'token' => $token,
            'expires_at' => now()->addMinutes($lifetimeMinutes),
        ]);
    }

    public function validateDataAccessToken(string $token): ?DataAccessToken
    {
        $dataToken = DataAccessToken::where('token', $token)->first();

        if (! $dataToken || ! $dataToken->isValid()) {
            return null;
        }

        return $dataToken;
    }

    public function accessSharedData(DataAccessToken $token, string $userId): array
    {
        $agreement = DataSharingAgreement::where('user_id', $token->user_id)
            ->where('source_app_id', $token->granting_app_id)
            ->where('target_app_id', $token->requesting_app_id)
            ->where('consent_status', 'granted')
            ->whereNull('revoked_at')
            ->first();

        if (! $agreement) {
            throw new \RuntimeException('Data sharing agreement is no longer valid.');
        }

        $data = [];
        foreach ($agreement->data_keys as $key) {
            $store = UserDataStore::where('user_id', $userId)
                ->where('app_id', $token->granting_app_id)
                ->where('key', $key)
                ->first();

            if ($store) {
                $data[$key] = $store->value;
            }
        }

        $this->auditService->logDataHubAccess(
            $token->user,
            $token->requestingApp,
            $token->grantingApp
        );

        return $data;
    }

    public function revokeDataSharingAgreement(DataSharingAgreement $agreement): void
    {
        $agreement->revoke();

        DataAccessToken::where('requesting_app_id', $agreement->target_app_id)
            ->where('granting_app_id', $agreement->source_app_id)
            ->where('user_id', $agreement->user_id)
            ->delete();
    }
}
