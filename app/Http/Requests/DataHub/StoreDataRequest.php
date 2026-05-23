<?php

namespace App\Http\Requests\DataHub;

use Illuminate\Foundation\Http\FormRequest;

class StoreDataRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'key' => ['required', 'string', 'max:255', 'regex:/^[a-zA-Z0-9._-]+$/'],
            'value' => ['required'],
        ];
    }
}
