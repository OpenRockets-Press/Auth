<?php

use App\Http\Controllers\Api\Settings\TrustedDeviceController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->prefix('settings')->group(function () {
    Route::get('/devices', [TrustedDeviceController::class, 'index']);
    Route::post('/devices/trust', [TrustedDeviceController::class, 'trustCurrent']);
    Route::delete('/devices/{device}', [TrustedDeviceController::class, 'destroy']);
});
