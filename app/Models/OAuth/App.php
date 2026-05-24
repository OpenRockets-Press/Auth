<?php

namespace App\Models\OAuth;

use App\Models\Admin\ApiKey;
use App\Models\Admin\WebhookEndpoint;
use App\Models\Compliance\AuditLog;
use App\Models\DataHub\DataAccessToken;
use App\Models\DataHub\DataRequest;
use App\Models\DataHub\DataSharingAgreement;
use App\Models\DataHub\UserDataStore;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Passport\Client;

class App extends Model
{
    use HasFactory, SoftDeletes;

    protected $casts = [
        'redirect_uris' => 'array',
        'is_system' => 'boolean',
        'verified_at' => 'datetime',
        'suspended_at' => 'datetime',
    ];

    protected $fillable = [
        'owner_id',
        'client_id',
        'name',
        'description',
        'icon_url',
        'status',
        'is_system',
        'redirect_uris',
        'homepage_url',
        'privacy_policy_url',
        'terms_url',
        'category',
        'verified_at',
        'suspended_at',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function scopes(): HasMany
    {
        return $this->hasMany(AppScope::class);
    }

    public function consentRecords(): HasMany
    {
        return $this->hasMany(ConsentRecord::class);
    }

    public function webhookEndpoints(): HasMany
    {
        return $this->hasMany(WebhookEndpoint::class);
    }

    public function userDataStores(): HasMany
    {
        return $this->hasMany(UserDataStore::class);
    }

    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function dataSharingAgreementsAsSource(): HasMany
    {
        return $this->hasMany(DataSharingAgreement::class, 'source_app_id');
    }

    public function dataSharingAgreementsAsTarget(): HasMany
    {
        return $this->hasMany(DataSharingAgreement::class, 'target_app_id');
    }

    public function dataAccessTokensAsRequesting(): HasMany
    {
        return $this->hasMany(DataAccessToken::class, 'requesting_app_id');
    }

    public function dataAccessTokensAsGranting(): HasMany
    {
        return $this->hasMany(DataAccessToken::class, 'granting_app_id');
    }

    public function dataRequestsAsRequesting(): HasMany
    {
        return $this->hasMany(DataRequest::class, 'requesting_app_id');
    }

    public function dataRequestsAsTarget(): HasMany
    {
        return $this->hasMany(DataRequest::class, 'target_app_id');
    }

    public function isVerified(): bool
    {
        return $this->status === 'verified' || $this->is_system;
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended' || $this->suspended_at !== null;
    }

    public function isActive(): bool
    {
        return ! $this->isSuspended() && $this->status !== 'rejected';
    }
}
