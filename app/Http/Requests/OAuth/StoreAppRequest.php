<?php

namespace App\Http\Requests\OAuth;

use Illuminate\Foundation\Http\FormRequest;

class StoreAppRequest extends FormRequest
{
    public function authorize(): bool
    {
        return true;
    }

    public function rules(): array
    {
        return [
            'name' => ['required', 'string', 'max:255'],
            'description' => ['nullable', 'string', 'max:1000'],
            'icon_url' => ['nullable', 'url'],
            'redirect_uris' => ['required', 'array', 'min:1', 'max:10'],
            'redirect_uris.*' => ['required', 'url', function ($attribute, $value, $fail) {
                if (! $this->isSafeRedirectUri($value)) {
                    $fail('The '.$attribute.' must be a valid HTTPS or localhost HTTP URL for redirects.');
                }
            }],
            'homepage_url' => ['nullable', 'url'],
            'privacy_policy_url' => ['nullable', 'url'],
            'terms_url' => ['nullable', 'url'],
            'category' => ['nullable', 'string', 'max:100'],
        ];
    }

    protected function isSafeRedirectUri(string $uri): bool
    {
        $parsed = parse_url($uri);

        if (! isset($parsed['scheme']) || ! isset($parsed['host'])) {
            return false;
        }

        if (! in_array(strtolower($parsed['scheme']), ['https', 'http'], true)) {
            return false;
        }

        if (strtolower($parsed['scheme']) === 'http') {
            $host = strtolower($parsed['host']);

            if ($host !== 'localhost' && ! str_ends_with($host, '.localhost')) {
                return false;
            }
        }

        if (isset($parsed['fragment'])) {
            return false;
        }

        if (isset($parsed['user']) || isset($parsed['pass'])) {
            return false;
        }

        return true;
    }
}
