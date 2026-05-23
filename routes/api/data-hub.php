<?php

use App\Http\Controllers\Api\DataHub\DataHubController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->group(function () {
    Route::prefix('data-hub')->group(function () {
        Route::post('/{app}/store', [DataHubController::class, 'store']);
        Route::get('/{app}/data', [DataHubController::class, 'index']);
        Route::get('/{app}/data/{key}', [DataHubController::class, 'show']);
        Route::delete('/{app}/data/{key}', [DataHubController::class, 'destroy']);

        Route::post('/{app}/request-sharing', [DataHubController::class, 'requestSharing']);
        Route::post('/{app}/exchange-token', [DataHubController::class, 'exchangeToken']);

        Route::get('/agreements', [DataHubController::class, 'myAgreements']);
        Route::delete('/agreements/{agreementId}', [DataHubController::class, 'revokeAgreement']);

        Route::post('/requests/{dataRequest}/grant', [DataHubController::class, 'grantConsent']);
        Route::post('/requests/{dataRequest}/deny', [DataHubController::class, 'denyConsent']);
    });

    Route::get('/data-hub/access/{userId}', [DataHubController::class, 'accessData']);
});
