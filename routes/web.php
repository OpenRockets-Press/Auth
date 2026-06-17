<?php

use Illuminate\Support\Facades\Route;

Route::inertia('/', 'welcome')->name('home');

Route::get('/login', function () {
    return redirect('https://accounts.openrockets.com/login');
})->name('login');

Route::get('/auth/sso', [\App\Http\Controllers\Auth\SsoController::class, 'handle'])->name('sso.handle');
Route::middleware(['auth', 'verified'])->group(function () {
    Route::inertia('dashboard', 'dashboard')->name('dashboard');
});

require __DIR__.'/settings.php';
