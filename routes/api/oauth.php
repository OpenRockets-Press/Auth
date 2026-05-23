<?php

use App\Http\Controllers\Api\OAuth\AppsController;
use App\Http\Controllers\Api\OAuth\ConsentController;
use App\Http\Controllers\Api\OAuth\OidcDiscoveryController;
use Illuminate\Support\Facades\Route;

Route::get('/.well-known/openid-configuration', OidcDiscoveryController::class);

Route::middleware('auth:api')->group(function () {
    Route::prefix('apps')->group(function () {
        Route::get('/', [AppsController::class, 'index']);
        Route::post('/', [AppsController::class, 'store']);
        Route::get('/{app}', [AppsController::class, 'show']);
        Route::put('/{app}', [AppsController::class, 'update']);
        Route::post('/{app}/regenerate-secret', [AppsController::class, 'regenerateSecret']);
        Route::get('/{app}/consents', [AppsController::class, 'consents']);
        Route::delete('/{app}/consents', [AppsController::class, 'revokeConsents']);
    });

    Route::prefix('consent')->group(function () {
        Route::get('/my', [ConsentController::class, 'myConsents']);
        Route::post('/{app}/grant', [ConsentController::class, 'grant']);
        Route::delete('/{record}', [ConsentController::class, 'revoke']);
    });
});
