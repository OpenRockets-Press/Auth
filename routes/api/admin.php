<?php

use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\Admin\ImpersonationController;
use App\Http\Controllers\Api\Admin\WebhookController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->middleware(['auth:api', EnsureAdmin::class])->group(function () {
    Route::post('/users/{user}/impersonate', [ImpersonationController::class, 'store']);
    Route::post('/impersonate/stop', [ImpersonationController::class, 'destroy']);
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

    Route::get('/webhooks', [WebhookController::class, 'index']);
    Route::post('/webhooks', [WebhookController::class, 'store']);
    Route::get('/webhooks/{endpoint}', [WebhookController::class, 'show']);
    Route::put('/webhooks/{endpoint}', [WebhookController::class, 'update']);
    Route::post('/webhooks/{endpoint}/regenerate-secret', [WebhookController::class, 'regenerateSecret']);
    Route::get('/webhooks/{endpoint}/deliveries', [WebhookController::class, 'deliveries']);
    Route::delete('/webhooks/{endpoint}', [WebhookController::class, 'destroy']);
});
