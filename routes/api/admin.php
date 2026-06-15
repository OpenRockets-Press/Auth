<?php

use App\Http\Controllers\Api\Admin\AdminController;
use App\Http\Controllers\Api\Admin\ImpersonationController;
use App\Http\Controllers\Api\Admin\WebhookController;
use App\Http\Controllers\Api\Admin\AdminAuthController;
use App\Http\Middleware\EnsureAdmin;
use Illuminate\Support\Facades\Route;

Route::prefix('admin')->group(function () {
    Route::get('/auth/google/redirect', [AdminAuthController::class, 'redirect']);
    Route::get('/auth/google/callback', [AdminAuthController::class, 'callback']);
});

Route::prefix('admin')->middleware(['auth:api', EnsureAdmin::class])->group(function () {
    Route::post('/users/{user}/impersonate', [ImpersonationController::class, 'store'])->middleware('throttle:5,1');
    Route::post('/impersonate/stop', [ImpersonationController::class, 'destroy']);
    Route::get('/impersonate/status', [ImpersonationController::class, 'status']);
    Route::get('/users', [AdminController::class, 'users']);
    Route::get('/users/{user}', [AdminController::class, 'user']);
    Route::get('/users/{user}/consents', [AdminController::class, 'userConsents']);
    Route::get('/users/{user}/social-accounts', [AdminController::class, 'userSocialAccounts']);
    Route::get('/users/{user}/data-requests', [AdminController::class, 'userDataRequests']);
    Route::get('/users/{user}/audit-logs', [AdminController::class, 'userAuditLogs']);
    Route::post('/users/{user}/suspend', [AdminController::class, 'suspendUser']);
    Route::post('/users/{user}/unsuspend', [AdminController::class, 'unsuspendUser']);
    Route::post('/users/{user}/unlock', [AdminController::class, 'unlockUser']);

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
