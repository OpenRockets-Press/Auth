<?php

namespace App\Http\Requests\DataHub;

use Illuminate\Foundation\Http\FormRequest;

class ExchangeTokenRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'granting_app_id' => ['required', 'exists:apps,id'],
            'scopes' => ['required', 'array', 'min:1'],
            'scopes.*' => ['required', 'string'],
        ];
    }
}
