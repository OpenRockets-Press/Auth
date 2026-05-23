<?php

return [

    'postmark' => [
        'key' => env('POSTMARK_API_KEY'),
    ],

    'resend' => [
        'key' => env('RESEND_API_KEY'),
    ],

    'ses' => [
        'key' => env('AWS_ACCESS_KEY_ID'),
        'secret' => env('AWS_SECRET_ACCESS_KEY'),
        'region' => env('AWS_DEFAULT_REGION', 'us-east-1'),
    ],

    'slack' => [
        'notifications' => [
            'bot_user_oauth_token' => env('SLACK_BOT_USER_OAUTH_TOKEN'),
            'channel' => env('SLACK_BOT_USER_DEFAULT_CHANNEL'),
        ],
    ],

    'google' => [
        'client_id' => env('SOCIALITE_GOOGLE_CLIENT_ID'),
        'client_secret' => env('SOCIALITE_GOOGLE_CLIENT_SECRET'),
        'redirect' => env('SOCIALITE_GOOGLE_REDIRECT'),
    ],

    'apple' => [
        'client_id' => env('SOCIALITE_APPLE_CLIENT_ID'),
        'client_secret' => env('SOCIALITE_APPLE_CLIENT_SECRET'),
        'redirect' => env('SOCIALITE_APPLE_REDIRECT'),
    ],

    'github' => [
        'client_id' => env('SOCIALITE_GITHUB_CLIENT_ID'),
        'client_secret' => env('SOCIALITE_GITHUB_CLIENT_SECRET'),
        'redirect' => env('SOCIALITE_GITHUB_REDIRECT'),
    ],

    'microsoft' => [
        'client_id' => env('SOCIALITE_MICROSOFT_CLIENT_ID'),
        'client_secret' => env('SOCIALITE_MICROSOFT_CLIENT_SECRET'),
        'redirect' => env('SOCIALITE_MICROSOFT_REDIRECT'),
    ],

    'facebook' => [
        'client_id' => env('SOCIALITE_FACEBOOK_CLIENT_ID'),
        'client_secret' => env('SOCIALITE_FACEBOOK_CLIENT_SECRET'),
        'redirect' => env('SOCIALITE_FACEBOOK_REDIRECT'),
    ],

    'twitter' => [
        'client_id' => env('SOCIALITE_TWITTER_CLIENT_ID'),
        'client_secret' => env('SOCIALITE_TWITTER_CLIENT_SECRET'),
        'redirect' => env('SOCIALITE_TWITTER_REDIRECT'),
    ],

];
