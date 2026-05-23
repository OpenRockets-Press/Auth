<?php

namespace App\Providers;

use Carbon\CarbonImmutable;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Passport\Passport;

class AppServiceProvider extends ServiceProvider
{
    public function register(): void
    {
        //
    }

    public function boot(): void
    {
        $this->configureDefaults();
        $this->configurePassport();
        $this->configureRateLimiting();
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): ?Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : null,
        );
    }

    protected function configurePassport(): void
    {
        Passport::tokensExpireIn(now()->addMinutes(config('auth-system.session_lifetime_minutes', 480)));
        Passport::refreshTokensExpireIn(now()->addDays(config('auth-system.remember_lifetime_days', 30)));
        Passport::personalAccessTokensExpireIn(now()->addMinutes(config('auth-system.session_lifetime_minutes', 480)));

        Passport::tokensCan([
            'openid' => 'OpenID Connect identifier',
            'profile' => 'Access user profile information',
            'email' => 'Access user email address',
            'phone' => 'Access user phone number',
            'address' => 'Access user physical address',
            'offline_access' => 'Access resources when user is offline',
        ]);
    }

    protected function configureRateLimiting(): void
    {
        RateLimiter::for('api', fn ($request) => Limit::perMinute(60)->by($request->user()?->id ?: $request->ip()));
        RateLimiter::for('auth', fn ($request) => Limit::perMinute(10)->by($request->ip()));
        RateLimiter::for('admin', fn ($request) => Limit::perMinute(120)->by($request->user()?->id));
    }
}
