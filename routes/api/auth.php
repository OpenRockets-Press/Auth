<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\SessionController;
use App\Http\Controllers\Api\Auth\TwoFactorController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');

Route::middleware('auth:api')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::post('/auth/revoke-other-tokens', [AuthController::class, 'revokeAllTokens']);

    Route::prefix('2fa')->group(function () {
        Route::post('/enable', [TwoFactorController::class, 'enable']);
        Route::post('/confirm', [TwoFactorController::class, 'confirm']);
        Route::post('/disable', [TwoFactorController::class, 'disable']);
        Route::get('/recovery-codes', [TwoFactorController::class, 'recoveryCodes']);
    });

    Route::prefix('sessions')->group(function () {
        Route::get('/', [SessionController::class, 'index']);
        Route::delete('/{tokenId}', [SessionController::class, 'destroy']);
        Route::delete('/', [SessionController::class, 'destroyAll']);
    });
});
