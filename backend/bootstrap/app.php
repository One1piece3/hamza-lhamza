<?php

use Illuminate\Auth\AuthenticationException;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Request;
use Illuminate\Validation\ValidationException;
use Symfony\Component\HttpKernel\Exception\HttpExceptionInterface;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->append(\Illuminate\Http\Middleware\HandleCors::class);

        $middleware->alias([
            'admin.token' => \App\Http\Middleware\AdminTokenMiddleware::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (ValidationException $exception, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            return response()->json([
                'message' => 'Les donnees envoyees sont invalides.',
                'errors' => $exception->errors(),
            ], $exception->status);
        });

        $exceptions->render(function (AuthenticationException $exception, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            return response()->json([
                'message' => 'Authentification requise.',
            ], 401);
        });

        $exceptions->render(function (\Throwable $exception, Request $request) {
            if (!$request->is('api/*')) {
                return null;
            }

            if ($exception instanceof HttpExceptionInterface) {
                return response()->json([
                    'message' => $exception->getMessage() !== '' ? $exception->getMessage() : 'Une erreur est survenue.',
                ], $exception->getStatusCode());
            }

            report($exception);

            return response()->json([
                'message' => 'Une erreur serveur est survenue. Merci de reessayer.',
            ], 500);
        });
    })->create();
