<?php

$frontendOrigins = array_values(array_filter(array_map(
    static fn ($origin) => rtrim(trim((string) $origin), '/'),
    array_merge(
        [
            'http://localhost:5173',
            'http://127.0.0.1:5173',
            'https://hamza-lhamza.vercel.app',
        ],
        explode(',', (string) env('FRONTEND_URLS', '')),
        [env('FRONTEND_URL')]
    )
)));

return [

    'paths' => ['api/*', 'sanctum/csrf-cookie'],

    'allowed_methods' => ['*'],

    'allowed_origins' => $frontendOrigins,

    'allowed_origins_patterns' => [
        '#^https://.*\.vercel\.app$#',
        '#^http://localhost(:\d+)?$#',
        '#^http://127\.0\.0\.1(:\d+)?$#',
        '#^http://192\.168\.\d+\.\d+(:\d+)?$#',
        '#^http://10\.\d+\.\d+\.\d+(:\d+)?$#',
        '#^http://172\.(1[6-9]|2\d|3[0-1])\.\d+\.\d+(:\d+)?$#',
    ],

    'allowed_headers' => ['*'],

    'exposed_headers' => [],

    'max_age' => 0,

    'supports_credentials' => false,

];
