<?php

use App\Http\Controllers\Api\OnboardingController;
use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::middleware(['auth', 'verified'])->group(function () {
    Route::get('auth/onboarding', [OnboardingController::class, 'show'])->name('onboarding');
    Route::post('auth/onboarding', [OnboardingController::class, 'complete'])->name('onboarding.complete');

    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
