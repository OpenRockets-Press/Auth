<?php

use App\Http\Controllers\Api\Social\SocialController;
use Illuminate\Support\Facades\Route;

Route::prefix('social')->group(function () {
    Route::get('/{provider}/redirect', [SocialController::class, 'redirect']);
    Route::get('/{provider}/callback', [SocialController::class, 'callback']);

    Route::middleware('auth:api')->group(function () {
        Route::post('/link', [SocialController::class, 'link']);
        Route::delete('/{provider}', [SocialController::class, 'unlink']);
        Route::get('/accounts', [SocialController::class, 'linkedAccounts']);
    });
});
