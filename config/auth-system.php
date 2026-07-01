<?php

return [

    'max_login_attempts' => env('AUTH_MAX_LOGIN_ATTEMPTS', 5),

    'lockout_duration' => env('AUTH_LOCKOUT_DURATION', 60),

    'session_lifetime_minutes' => env('AUTH_SESSION_LIFETIME_MINUTES', 5256000),

    'remember_lifetime_days' => env('AUTH_REMEMBER_LIFETIME_DAYS', 3650),

    'audit' => [
        'enabled' => true,
        'retention_days' => env('AUDIT_LOG_RETENTION_DAYS', 365),
    ],

    'webhooks' => [
        'max_retries' => 5,
        'retry_delay_seconds' => 60,
        'timeout_seconds' => 30,
    ],

    'data_hub' => [
        'token_lifetime_minutes' => 60,
        'max_data_keys_per_request' => 50,
    ],

    'parental_consent' => [
        'token_lifetime_hours' => 48,
        'methods' => [
            'email',
            'payment',
            'gov_id',
        ],
    ],

    'ip_geolocation' => [
        'service' => env('IP_GEOLOCATION_SERVICE', 'ip-api'),
        'maxmind_database_path' => env('MAXMIND_DATABASE_PATH', storage_path('app/GeoLite2-City.mmdb')),
    ],

    'device_fingerprint' => [
        'secret_key' => env('DEVICE_FINGERPRINT_KEY'),
    ],

];
