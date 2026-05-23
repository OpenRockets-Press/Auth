<?php

use App\Http\Controllers\Api\Admin\AdminController;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware('auth:api')->group(function () {
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/users/{user}', [AdminController::class, 'user']);
    Route::post('/users/{user}/suspend', [AdminController::class, 'suspendUser']);
    Route::post('/users/{user}/unsuspend', [AdminController::class, 'unsuspendUser']);

    Route::get('/apps', [AdminController::class, 'apps']);
    Route::post('/apps/{app}/verify', [AdminController::class, 'verifyApp']);
    Route::post('/apps/{app}/reject', [AdminController::class, 'rejectApp']);
    Route::post('/apps/{app}/suspend', [AdminController::class, 'suspendApp']);

    Route::get('/audit-logs', [AdminController::class, 'auditLogs']);

    Route::get('/data-requests', [AdminController::class, 'dataRequests']);
    Route::post('/data-requests/{dataRequest}/fulfill', [AdminController::class, 'fulfillDataRequest']);

    Route::get('/analytics', [AdminController::class, 'analytics']);

    Route::get('/countries', [AdminController::class, 'countries']);
    Route::put('/countries/{code}', [AdminController::class, 'updateCountry']);
});
