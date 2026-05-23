<?php

use App\Http\Controllers\Api\Compliance\ComplianceController;
use App\Http\Controllers\Api\Compliance\DataExportDownloadController;
use Illuminate\Support\Facades\Route;

Route::get('/compliance/countries', [ComplianceController::class, 'countries']);
Route::get('/compliance/country/{code}', [ComplianceController::class, 'country']);

Route::middleware('auth:api')->group(function () {
    Route::prefix('compliance')->group(function () {
        Route::get('/profile', [ComplianceController::class, 'getProfile']);
        Route::post('/profile', [ComplianceController::class, 'profile']);
        Route::post('/parental-consent/request', [ComplianceController::class, 'requestParentalConsent']);
        Route::post('/data-export', [ComplianceController::class, 'requestDataExport']);
        Route::post('/data-deletion', [ComplianceController::class, 'requestDataDeletion']);
        Route::get('/data-export/{dataRequest}/download', DataExportDownloadController::class);
        Route::get('/data-requests', [ComplianceController::class, 'dataRequests']);
    });

    Route::post('/consent/verify/{token}', [ComplianceController::class, 'respondToParentalConsent']);
});
