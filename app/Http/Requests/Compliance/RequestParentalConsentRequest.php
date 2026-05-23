<?php

namespace App\Http\Requests\Compliance;

use Illuminate\Foundation\Http\FormRequest;

class RequestParentalConsentRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'parent_email' => ['required', 'email'],
            'parent_name' => ['nullable', 'string', 'max:255'],
        ];
    }
}
