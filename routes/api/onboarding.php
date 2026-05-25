<?php

use App\Http\Controllers\Api\OnboardingController;
use Illuminate\Support\Facades\Route;

Route::middleware('auth:api')->prefix('onboarding')->group(function () {
    Route::get('/', [OnboardingController::class, 'getStatus']);
    Route::post('/', [OnboardingController::class, 'complete'])->middleware('throttle:5,1');
});
