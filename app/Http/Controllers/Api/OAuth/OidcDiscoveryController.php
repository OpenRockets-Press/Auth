<?php

namespace App\Http\Controllers\Api\OAuth;

use App\Http\Controllers\Controller;
use Illuminate\Http\JsonResponse;
use Laravel\Passport\Passport;

class OidcDiscoveryController extends Controller
{
    public function __invoke(): JsonResponse
    {
        $url = rtrim(config('app.url'), '/');

        return response()->json([
            'issuer' => $url,
            'authorization_endpoint' => $url.'/oauth/authorize',
            'token_endpoint' => $url.'/oauth/token',
            'token_endpoint_auth_methods_supported' => config('auth-system.oidc.auth_methods', [
                'client_secret_basic',
                'client_secret_post',
                'private_key_jwt',
            ]),
            'jwks_uri' => $url.'/oauth/jwks',
            'registration_endpoint' => $url.'/api/apps',
            'scopes_supported' => $this->getSupportedScopes(),
            'response_types_supported' => config('auth-system.oidc.response_types', ['code']),
            'grant_types_supported' => config('auth-system.oidc.grant_types', [
                'authorization_code',
                'refresh_token',
            ]),
            'subject_types_supported' => config('auth-system.oidc.subject_types', ['public']),
            'id_token_signing_alg_values_supported' => config('auth-system.oidc.signing_algorithms', ['RS256']),
            'code_challenge_methods_supported' => config('auth-system.oidc.pkce_methods', ['S256']),
            'claims_supported' => config('auth-system.oidc.claims', [
                'sub',
                'name',
                'email',
                'email_verified',
                'picture',
                'updated_at',
            ]),
            'request_parameter_supported' => config('auth-system.oidc.request_parameter_supported', false),
            'request_uri_parameter_supported' => config('auth-system.oidc.request_uri_parameter_supported', false),
        ]);
    }

    protected function getSupportedScopes(): array
    {
        $defaultScopes = [
            'openid',
            'profile',
            'email',
            'phone',
            'address',
        ];

        $passportScopes = array_keys(Passport::$scopes ?? []);

        return array_values(array_unique(array_merge($defaultScopes, $passportScopes)));
    }
}
