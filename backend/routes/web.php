<?php

use Illuminate\Support\Facades\Route;

Route::get('/media/{path}', function (string $path) {
    if (str_contains($path, '..')) {
        abort(404);
    }

    $mediaRoot = trim((string) env('MEDIA_ROOT', env('FILESYSTEM_PUBLIC_ROOT', '')));

    if ($mediaRoot === '') {
        $mediaRoot = is_dir('/data') || str_starts_with(PHP_OS_FAMILY, 'Linux')
            ? '/data/media'
            : public_path('media');
    }

    $fullPath = rtrim($mediaRoot, "\\/") . DIRECTORY_SEPARATOR . str_replace(['/', '\\'], DIRECTORY_SEPARATOR, ltrim($path, '/'));

    if (!is_file($fullPath)) {
        abort(404);
    }

    return response()->file($fullPath, [
        'Cache-Control' => 'public, max-age=31536000',
    ]);
})->where('path', '.*');

Route::get('/', function () {
    return view('welcome');
});
