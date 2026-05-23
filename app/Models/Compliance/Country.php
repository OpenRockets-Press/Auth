<?php

namespace App\Models\Compliance;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Country extends Model
{
    use HasFactory;

    public $incrementing = false;

    protected $keyType = 'string';

    protected $primaryKey = 'code';

    protected $fillable = [
        'code',
        'name',
        'age_of_digital_consent',
        'gdpr_applicable',
        'coppa_applicable',
        'data_retention_days',
        'requires_parental_consent_below_age',
    ];

    protected $casts = [
        'age_of_digital_consent' => 'integer',
        'gdpr_applicable' => 'boolean',
        'coppa_applicable' => 'boolean',
        'data_retention_days' => 'integer',
        'requires_parental_consent_below_age' => 'integer',
    ];

    public function requiresParentalConsent(int $age): bool
    {
        return $age < $this->requires_parental_consent_below_age;
    }

    public function isGDPRApplicable(): bool
    {
        return $this->gdpr_applicable;
    }

    public function isCOPPAApplicable(): bool
    {
        return $this->coppa_applicable;
    }
}
