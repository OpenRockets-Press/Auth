<?php

return [

    'max_login_attempts' => env('AUTH_MAX_LOGIN_ATTEMPTS', 5),

    'lockout_duration' => env('AUTH_LOCKOUT_DURATION', 60),

    'session_lifetime_minutes' => env('AUTH_SESSION_LIFETIME_MINUTES', 480),

    'remember_lifetime_days' => env('AUTH_REMEMBER_LIFETIME_DAYS', 30),

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

];
