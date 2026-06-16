<?php

namespace App\Models;

use App\Models\Admin\ApiKey;
use App\Models\Admin\Role;
use App\Models\Admin\TrustedDevice;
use App\Models\Compliance\AuditLog;
use App\Models\Compliance\DataAccessRequest;
use App\Models\Compliance\ParentalConsent;
use App\Models\Compliance\UserProfile;
use App\Models\DataHub\DataAccessToken;
use App\Models\DataHub\DataRequest;
use App\Models\DataHub\DataSharingAgreement;
use App\Models\DataHub\SocialAccount;
use App\Models\DataHub\UserDataStore;
use App\Models\OAuth\App;
use App\Models\OAuth\ConsentRecord;
use Illuminate\Database\Eloquent\Attributes\Fillable;
use Illuminate\Database\Eloquent\Attributes\Hidden;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\Relations\HasOne;
use Illuminate\Database\Eloquent\SoftDeletes;
use Illuminate\Contracts\Auth\MustVerifyEmail;
use Illuminate\Foundation\Auth\User as Authenticatable;
use Illuminate\Notifications\Notifiable;
use Laravel\Fortify\Contracts\PasskeyUser;
use Laravel\Fortify\PasskeyAuthenticatable;
use Laravel\Fortify\TwoFactorAuthenticatable;
use Laravel\Passport\HasApiTokens;

#[Fillable(['name', 'email', 'password', 'status', 'last_login_at', 'login_method', 'failed_login_attempts', 'locked_until'])]
#[Hidden(['password', 'two_factor_secret', 'two_factor_recovery_codes', 'remember_token'])]
class User extends Authenticatable implements PasskeyUser, MustVerifyEmail
{
    use HasApiTokens, HasFactory, Notifiable, PasskeyAuthenticatable, TwoFactorAuthenticatable, SoftDeletes;

    protected function casts(): array
    {
        return [
            'email_verified_at' => 'datetime',
            'last_login_at' => 'datetime',
            'locked_until' => 'datetime',
            'password' => 'hashed',
            'two_factor_confirmed_at' => 'datetime',
        ];
    }

    public function apps(): HasMany
    {
        return $this->hasMany(App::class, 'owner_id');
    }

    public function consentRecords(): HasMany
    {
        return $this->hasMany(ConsentRecord::class);
    }

    public function profile(): HasOne
    {
        return $this->hasOne(UserProfile::class);
    }

    public function parentalConsents(): HasMany
    {
        return $this->hasMany(ParentalConsent::class);
    }

    public function dataAccessRequests(): HasMany
    {
        return $this->hasMany(DataAccessRequest::class);
    }

    public function auditLogs(): HasMany
    {
        return $this->hasMany(AuditLog::class);
    }

    public function socialAccounts(): HasMany
    {
        return $this->hasMany(SocialAccount::class);
    }

    public function dataStores(): HasMany
    {
        return $this->hasMany(UserDataStore::class);
    }

    public function dataSharingAgreements(): HasMany
    {
        return $this->hasMany(DataSharingAgreement::class);
    }

    public function dataAccessTokens(): HasMany
    {
        return $this->hasMany(DataAccessToken::class);
    }

    public function dataRequests(): HasMany
    {
        return $this->hasMany(DataRequest::class);
    }

    public function roles(): BelongsToMany
    {
        return $this->belongsToMany(Role::class);
    }

    public function trustedDevices(): HasMany
    {
        return $this->hasMany(TrustedDevice::class);
    }

    public function apiKeys(): HasMany
    {
        return $this->hasMany(ApiKey::class);
    }

    public function isAdmin(): bool
    {
        return $this->roles()->whereIn('name', ['super_admin', 'moderator', 'reviewer'])->exists();
    }

    public function hasPermission(string $permission): bool
    {
        return $this->roles()->whereJsonContains('permissions', $permission)->exists();
    }

    public function isLocked(): bool
    {
        return $this->locked_until !== null && $this->locked_until->isFuture();
    }

    public function isMinor(): bool
    {
        if (! $this->profile || ! $this->profile->date_of_birth) {
            return false;
        }

        return $this->profile->date_of_birth->diffInYears(now()) < 18;
    }

    public function hasCompletedOnboarding(): bool
    {
        if (! $this->profile) {
            return true;
        }

        return $this->profile->onboarding_status === 'completed'
            && $this->profile->country_code !== null
            && $this->profile->state !== null
            && $this->profile->date_of_birth !== null;
    }
}
