<?php

use Illuminate\Support\Facades\Route;

Route::get('/media/{path}', function (string $path) {
    if (str_contains($path, '..')) {
        abort(404);
    }

    $relativePath = str_replace(['/', '\\'], DIRECTORY_SEPARATOR, ltrim($path, '/'));
    $candidateRoots = array_values(array_filter([
        trim((string) env('MEDIA_ROOT', env('FILESYSTEM_PUBLIC_ROOT', ''))),
        '/data/media',
        public_path('media'),
    ]));

    $fullPath = null;

    foreach ($candidateRoots as $candidateRoot) {
        $candidatePath = rtrim($candidateRoot, "\\/") . DIRECTORY_SEPARATOR . $relativePath;

        if (is_file($candidatePath)) {
            $fullPath = $candidatePath;
            break;
        }
    }

    if ($fullPath === null) {
        abort(404);
    }

    return response()->file($fullPath, [
        'Cache-Control' => 'public, max-age=31536000',
    ]);
})->where('path', '.*');

Route::get('/', function () {
    return view('welcome');
});
