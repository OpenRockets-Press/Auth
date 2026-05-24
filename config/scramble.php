<?php

use Dedoc\Scramble\Http\Middleware\RestrictedDocsAccess;

return [
    'api_path' => 'api',

    'api_domain' => null,

    'export_path' => 'swagger.yaml',

    'info' => [
        'version' => env('API_VERSION', '1.0.0'),
        'description' => 'A GDPR/COPPA-compliant identity provider with OAuth 2.1/OIDC, minor parental consent flows, verified app ecosystem, and cross-app data hub (RFC 8693 Token Exchange).',
    ],

    'ui' => [
        'title' => 'Auth System API',
        'theme' => 'dark',
        'hide_try_it' => false,
        'hide_schemas' => false,
        'logo' => '',
        'try_it_credentials_policy' => 'include',
        'layout' => 'responsive',
    ],

    'servers' => [
        'Local' => 'http://localhost:8000/api',
        'Production' => 'https://auth.example.com/api',
    ],

    'enum_cases_description_strategy' => 'description',

    'enum_cases_names_strategy' => false,

    'flatten_deep_query_parameters' => true,

    'middleware' => [
        'web',
    ],

    'extensions' => [],
];
