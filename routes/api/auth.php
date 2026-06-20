<?php

use App\Http\Controllers\Api\Auth\AuthController;
use App\Http\Controllers\Api\Auth\SessionController;
use App\Http\Controllers\Api\Auth\TwoFactorController;
use Illuminate\Support\Facades\Route;

Route::post('/auth/login', [AuthController::class, 'login'])->middleware('throttle:10,1');
Route::post('/auth/register', [AuthController::class, 'register'])->middleware('throttle:5,1');
Route::post('/auth/register-with-consent', [AuthController::class, 'registerWithConsent'])->middleware('throttle:5,1');

use App\Http\Controllers\Api\Auth\OtpController;
use App\Http\Controllers\Api\Auth\WizardController;
Route::post('/auth/otp/send', [OtpController::class, 'send'])->middleware('throttle:5,1');
Route::post('/auth/otp/verify', [OtpController::class, 'verify'])->middleware('throttle:10,1');
Route::post('/auth/register-minor-wizard', [WizardController::class, 'registerMinorWizard'])->middleware('throttle:3,1');

Route::middleware('auth:api')->group(function () {
    Route::post('/auth/logout', [AuthController::class, 'logout']);
    Route::get('/auth/me', [AuthController::class, 'me']);
    Route::get('/auth/me/compliance', [AuthController::class, 'complianceStatus']);
    Route::post('/auth/revoke-other-tokens', [AuthController::class, 'revokeAllTokens']);

    Route::prefix('2fa')->group(function () {
        Route::post('/enable', [TwoFactorController::class, 'enable'])->middleware('throttle:5,1');
        Route::post('/confirm', [TwoFactorController::class, 'confirm'])->middleware('throttle:10,1');
        Route::post('/disable', [TwoFactorController::class, 'disable'])->middleware('throttle:5,1');
        Route::get('/recovery-codes', [TwoFactorController::class, 'recoveryCodes'])->middleware('throttle:10,1');
    });

    Route::prefix('sessions')->group(function () {
        Route::get('/', [SessionController::class, 'index']);
        Route::delete('/{tokenId}', [SessionController::class, 'destroy']);
        Route::delete('/', [SessionController::class, 'destroyAll']);
    });

    Route::post('/personal-access-tokens', function (Illuminate\Http\Request $request) {
        $request->validate([
            'name' => 'required|string|max:255',
        ]);
        $token = $request->user()->createToken($request->name);
        return response()->json([
            'token' => $token->accessToken,
            'name' => $request->name
        ]);
    });
});
