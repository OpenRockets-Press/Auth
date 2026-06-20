<?php

namespace App\Models\Compliance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserProfile extends Model
{
    use HasFactory;

    protected $casts = [
        'date_of_birth' => 'date',
        'age_verified' => 'boolean',
        'parental_consent_required' => 'boolean',
        'onboarding_completed_at' => 'datetime',
    ];

    protected $fillable = [
        'user_id',
        'date_of_birth',
        'country_code',
        'state',
        'city',
        'age_verified',
        'age_verification_method',
        'parental_consent_required',
        'parental_consent_status',
        'onboarding_status',
        'onboarding_completed_at',
        'phone_number',
        'school',
        'avatar_url',
        'pin',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_code', 'code');
    }

    public function getAgeAttribute(): ?int
    {
        if (! $this->date_of_birth) {
            return null;
        }

        return $this->date_of_birth->diffInYears(now());
    }

    public function isMinor(): bool
    {
        $age = $this->age;

        if ($age === null) {
            return false;
        }

        return $age < 18;
    }

    public function needsParentalConsent(): bool
    {
        if (! $this->country || ! $this->date_of_birth) {
            return false;
        }

        $age = $this->age;

        if ($age === null) {
            return false;
        }

        return $this->country->requiresParentalConsent($age);
    }

    public function hasConsent(): bool
    {
        return ! $this->parental_consent_required
            || $this->parental_consent_status === 'granted';
    }
}
