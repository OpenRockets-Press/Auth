<?php

namespace App\Http\Requests\Compliance;

use Illuminate\Foundation\Http\FormRequest;

class StoreUserProfileRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'date_of_birth' => ['required', 'date', 'before:today'],
            'country_code' => ['required', 'string', 'size:2', 'exists:countries,code'],
        ];
    }
}
