<?php

namespace App\Http\Resources\Compliance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserProfileResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'date_of_birth' => $this->date_of_birth,
            'country_code' => $this->country_code,
            'age' => $this->age,
            'age_verified' => $this->age_verified,
            'parental_consent_required' => $this->parental_consent_required,
            'parental_consent_status' => $this->parental_consent_status,
            'has_consent' => $this->hasConsent(),
        ];
    }
}
