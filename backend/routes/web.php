<?php

use Illuminate\Support\Facades\Route;

Route::get('/media/{path}', function (string $path) {
    if (str_contains($path, '..')) {
        abort(404);
    }

    $fullPath = public_path('media/' . ltrim($path, '/'));

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
