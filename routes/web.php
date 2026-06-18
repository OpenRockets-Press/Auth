<?php

use Illuminate\Support\Facades\Route;

Route::get('/', function () {
    return redirect()->route('dashboard');
})->name('home');

Route::middleware(['auth'])->group(function () {
    Route::get('onboarding', [\App\Http\Controllers\OnboardingController::class, 'index'])->name('onboarding');
    Route::post('onboarding', [\App\Http\Controllers\OnboardingController::class, 'store'])->name('onboarding.store');
    Route::get('onboarding/parental-consent', [\App\Http\Controllers\OnboardingController::class, 'parentalConsent'])->name('onboarding.parental-consent');
});

Route::get('/login', function () {
    return redirect('https://accounts.openrockets.com/login?redirect_uri=' . urlencode(route('sso.handle')));
})->name('login');

Route::get('/auth/sso', [\App\Http\Controllers\Auth\SsoController::class, 'handle'])->name('sso.handle');
Route::middleware(['auth'])->group(function () {
    Route::get('dashboard', [\App\Http\Controllers\DashboardController::class, 'index'])->name('dashboard');
    
    Route::get('consents', [\App\Http\Controllers\ConsentController::class, 'index'])->name('consents.index');
    Route::delete('consents/{id}', [\App\Http\Controllers\ConsentController::class, 'destroy'])->name('consents.destroy');
    
    Route::inertia('agreements', 'agreements/index')->name('agreements.index');

    Route::prefix('developer')->name('developer.')->group(function () {
        Route::get('apps', [\App\Http\Controllers\DeveloperAppController::class, 'index'])->name('apps.index');
        Route::get('apps/create', [\App\Http\Controllers\DeveloperAppController::class, 'create'])->name('apps.create');
        Route::post('apps', [\App\Http\Controllers\DeveloperAppController::class, 'store'])->name('apps.store');
        Route::get('apps/{id}', [\App\Http\Controllers\DeveloperAppController::class, 'show'])->name('apps.show');
    });
});

Route::middleware(['auth', 'admin'])->prefix('admin')->name('admin.')->group(function () {
    Route::get('/', [\App\Http\Controllers\AdminController::class, 'dashboard'])->name('dashboard');
    Route::get('users', [\App\Http\Controllers\AdminController::class, 'users'])->name('users.index');
    Route::get('apps', [\App\Http\Controllers\AdminController::class, 'apps'])->name('apps.index');
    Route::patch('apps/{id}/status', [\App\Http\Controllers\AdminController::class, 'updateAppStatus'])->name('apps.updateStatus');
    Route::patch('users/{id}/status', [\App\Http\Controllers\AdminController::class, 'updateUserStatus'])->name('users.updateStatus');
});

require __DIR__.'/settings.php';
