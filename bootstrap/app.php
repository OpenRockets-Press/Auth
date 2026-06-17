<?php

use App\Exceptions\BaseException;
use App\Http\Middleware\AuditRequest;
use App\Http\Middleware\AuthenticateWithApiKey;
use App\Http\Middleware\CheckAccountStatus;
use App\Http\Middleware\EnsureAdmin;
use App\Http\Middleware\EnsureAppIsActive;
use App\Http\Middleware\EnsureOnboardingComplete;
use App\Http\Middleware\EnsureParentalConsent;
use App\Http\Middleware\HandleAppearance;
use App\Http\Middleware\HandleInertiaRequests;
use Illuminate\Foundation\Application;
use Illuminate\Foundation\Configuration\Exceptions;
use Illuminate\Foundation\Configuration\Middleware;
use Illuminate\Http\Middleware\AddLinkHeadersForPreloadedAssets;
use Illuminate\Routing\Middleware\SubstituteBindings;

return Application::configure(basePath: dirname(__DIR__))
    ->withRouting(
        web: __DIR__.'/../routes/web.php',
        api: __DIR__.'/../routes/api.php',
        commands: __DIR__.'/../routes/console.php',
        health: '/up',
    )
    ->withMiddleware(function (Middleware $middleware): void {
        $middleware->encryptCookies(except: ['appearance', 'sidebar_state']);

        $middleware->redirectGuestsTo(fn () => 'https://accounts.openrockets.com/login');

        $middleware->web(append: [
            HandleAppearance::class,
            HandleInertiaRequests::class,
            AddLinkHeadersForPreloadedAssets::class,
        ]);

        $middleware->api(prepend: [
            SubstituteBindings::class,
            CheckAccountStatus::class,
            EnsureOnboardingComplete::class,
        ]);

        $middleware->alias([
            'admin' => EnsureAdmin::class,
            'app.active' => EnsureAppIsActive::class,
            'consent' => EnsureParentalConsent::class,
            'account.status' => CheckAccountStatus::class,
            'audit' => AuditRequest::class,
            'api.key' => AuthenticateWithApiKey::class,
        ]);
    })
    ->withExceptions(function (Exceptions $exceptions): void {
        $exceptions->render(function (BaseException $e) {
            return response()->json([
                'message' => $e->getErrorMessage(),
            ], $e->getStatusCode());
        });
    })->create();
