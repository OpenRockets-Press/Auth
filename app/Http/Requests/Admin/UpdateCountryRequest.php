<?php

namespace App\Http\Requests\Admin;

use Illuminate\Foundation\Http\FormRequest;

class UpdateCountryRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'age_of_digital_consent' => ['sometimes', 'integer', 'min:0', 'max:21'],
            'gdpr_applicable' => ['sometimes', 'boolean'],
            'coppa_applicable' => ['sometimes', 'boolean'],
            'data_retention_days' => ['sometimes', 'integer', 'min:1'],
            'requires_parental_consent_below_age' => ['sometimes', 'integer', 'min:0', 'max:21'],
        ];
    }
}
