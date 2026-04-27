<?php

$origin = $_SERVER['HTTP_ORIGIN'] ?? '';

if ($origin !== '') {
    $allowedOrigins = array_values(array_filter(array_map(
        static fn ($value) => rtrim(trim((string) $value), '/'),
        array_merge(
            ['https://hamza-lhamza.vercel.app'],
            explode(',', (string) getenv('FRONTEND_URLS')),
            [(string) getenv('FRONTEND_URL')]
        )
    )));

    $originMatchesPattern = preg_match('#^https://.*\.vercel\.app$#', $origin) === 1;

    if (in_array(rtrim($origin, '/'), $allowedOrigins, true) || $originMatchesPattern) {
        header("Access-Control-Allow-Origin: $origin");
        header('Vary: Origin');
        header('Access-Control-Allow-Methods: GET, POST, PUT, PATCH, DELETE, OPTIONS');
        header('Access-Control-Allow-Headers: Content-Type, Authorization, X-Requested-With, Accept, Origin');
    }
}

if (($_SERVER['REQUEST_METHOD'] ?? '') === 'OPTIONS') {
    http_response_code(204);
    exit;
}

use Illuminate\Foundation\Application;
use Illuminate\Http\Request;

define('LARAVEL_START', microtime(true));

if (file_exists($maintenance = __DIR__.'/../storage/framework/maintenance.php')) {
    require $maintenance;
}

require __DIR__.'/../vendor/autoload.php';

/** @var Application $app */
$app = require_once __DIR__.'/../bootstrap/app.php';

$app->handleRequest(Request::capture());
