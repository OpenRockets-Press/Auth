<?php

namespace App\Http\Resources\Compliance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class CountryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'code' => $this->code,
            'name' => $this->name,
            'age_of_digital_consent' => $this->age_of_digital_consent,
            'gdpr_applicable' => $this->gdpr_applicable,
            'coppa_applicable' => $this->coppa_applicable,
            'data_retention_days' => $this->data_retention_days,
            'requires_parental_consent_below_age' => $this->requires_parental_consent_below_age,
        ];
    }
}
