<?php

use App\Http\Controllers\Api\Compliance\ComplianceController;
use App\Http\Controllers\Api\Compliance\DataExportDownloadController;
use Illuminate\Support\Facades\Route;

Route::get('/compliance/countries', [ComplianceController::class, 'countries']);
Route::get('/compliance/country/{code}', [ComplianceController::class, 'country']);
Route::post('/consent/verify/{token}', [ComplianceController::class, 'respondToParentalConsent'])
    ->middleware('throttle:5,1');

Route::middleware('auth:api')->group(function () {
    Route::prefix('compliance')->group(function () {
        Route::get('/profile', [ComplianceController::class, 'getProfile']);
        Route::post('/profile', [ComplianceController::class, 'profile']);
        Route::post('/parental-consent/request', [ComplianceController::class, 'requestParentalConsent'])->middleware('throttle:3,60');
        Route::post('/data-export', [ComplianceController::class, 'requestDataExport'])->middleware('throttle:2,60');
        Route::post('/data-deletion', [ComplianceController::class, 'requestDataDeletion'])->middleware('throttle:3,60');
        Route::get('/data-export/{dataRequest}/download', DataExportDownloadController::class);
        Route::get('/data-export/{dataRequest}/file', [DataExportDownloadController::class, 'download'])
            ->name('compliance.data-export.download-file');
        Route::get('/data-requests', [ComplianceController::class, 'dataRequests']);
    });
});
