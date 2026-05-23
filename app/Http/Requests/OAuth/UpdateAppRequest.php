<?php

namespace App\Http\Requests\OAuth;

use Illuminate\Foundation\Http\FormRequest;

class UpdateAppRequest extends FormRequest
{
    public function authorize(): bool
    {
        return $this->user()->id === $this->route('app')->owner_id;
    }

    public function rules(): array
    {
        return [
            'name' => ['sometimes', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon_url' => ['nullable', 'url'],
            'redirect_uris' => ['sometimes', 'array', 'min:1'],
            'redirect_uris.*' => ['required', 'url'],
            'homepage_url' => ['nullable', 'url'],
            'privacy_policy_url' => ['nullable', 'url'],
            'terms_url' => ['nullable', 'url'],
            'category' => ['nullable', 'string', 'max:100'],
        ];
    }
}
