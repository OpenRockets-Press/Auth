<?php

return [

    'guard' => 'web',

    'middleware' => [],

    'private_key' => env('PASSPORT_PRIVATE_KEY', storage_path('oauth-private.key')),

    'public_key' => env('PASSPORT_PUBLIC_KEY', storage_path('oauth-public.key')),

    'connection' => env('PASSPORT_CONNECTION'),

    'personal_access_client_id' => env('PASSPORT_PERSONAL_ACCESS_CLIENT_ID'),

];
