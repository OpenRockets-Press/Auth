<?php

namespace App\Http\Requests\DataHub;

use Illuminate\Foundation\Http\FormRequest;

class RequestDataSharingRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'target_app_id' => ['required', 'exists:apps,id'],
            'data_keys' => ['required', 'array', 'min:1', 'max:'.config('auth-system.data_hub.max_data_keys_per_request', 50)],
            'data_keys.*' => ['required', 'string'],
        ];
    }
}
