<?php

namespace App\Providers;

use App\Models\Admin\WebhookEndpoint;
use App\Models\Compliance\DataAccessRequest;
use App\Models\DataHub\DataRequest;
use App\Models\DataHub\DataSharingAgreement;
use App\Models\OAuth\App;
use App\Models\OAuth\ConsentRecord;
use App\Models\User;
use App\Policies\AppPolicy;
use App\Policies\ConsentRecordPolicy;
use App\Policies\DataAccessRequestPolicy;
use App\Policies\DataSharingAgreementPolicy;
use App\Policies\UserPolicy;
use App\Policies\WebhookEndpointPolicy;
use Carbon\CarbonImmutable;
use Dedoc\Scramble\Generator;
use Dedoc\Scramble\Scramble;
use Illuminate\Cache\RateLimiting\Limit;
use Illuminate\Support\Facades\Date;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Gate;
use Illuminate\Support\Facades\RateLimiter;
use Illuminate\Support\Facades\Route;
use Illuminate\Support\ServiceProvider;
use Illuminate\Validation\Rules\Password;
use Laravel\Passport\Passport;
use Symfony\Component\Yaml\Yaml;

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
        $this->configurePolicies();
        $this->configureSwagger();
    }

    protected function configureSwagger(): void
    {
        if (!class_exists(\Dedoc\Scramble\Scramble::class)) {
            return;
        }

        Scramble::ignoreDefaultRoutes();

        Route::get('/swagger', function () {
            return view('scramble::docs', [
                'spec' => app(\Dedoc\Scramble\Generator::class)(Scramble::getGeneratorConfig(Scramble::DEFAULT_API)),
                'config' => Scramble::getGeneratorConfig(Scramble::DEFAULT_API),
            ]);
        })->name('swagger.ui');

        Route::get('/swagger.json', function () {
            return response()->json(
                app(\Dedoc\Scramble\Generator::class)(Scramble::getGeneratorConfig(Scramble::DEFAULT_API)),
                options: JSON_PRETTY_PRINT,
            );
        })->name('swagger.json');

        Route::get('/swagger.yaml', function () {
            $generator = app(Generator::class);
            $config = Scramble::getGeneratorConfig(Scramble::DEFAULT_API);
            $spec = $generator($config);

            return response(Yaml::dump($spec, 10, 2), 200, [
                'Content-Type' => 'text/yaml',
            ]);
        })->name('swagger.yaml');
    }

    protected function configurePolicies(): void
    {
        Gate::policy(App::class, AppPolicy::class);
        Gate::policy(User::class, UserPolicy::class);
        Gate::policy(DataAccessRequest::class, DataAccessRequestPolicy::class);
        Gate::policy(DataRequest::class, DataAccessRequestPolicy::class);
        Gate::policy(DataSharingAgreement::class, DataSharingAgreementPolicy::class);
        Gate::policy(WebhookEndpoint::class, WebhookEndpointPolicy::class);
        Gate::policy(ConsentRecord::class, ConsentRecordPolicy::class);
    }

    protected function configureDefaults(): void
    {
        Date::use(CarbonImmutable::class);

        DB::prohibitDestructiveCommands(
            app()->isProduction(),
        );

        Password::defaults(fn (): Password => app()->isProduction()
            ? Password::min(12)
                ->mixedCase()
                ->letters()
                ->numbers()
                ->symbols()
                ->uncompromised()
            : Password::min(8)
                ->letters()
                ->numbers()
                ->uncompromised(),
        );
    }

    protected function configurePassport(): void
    {
        Passport::tokensExpireIn(now()->addMinutes((int) config('auth-system.session_lifetime_minutes', 480)));
        Passport::refreshTokensExpireIn(now()->addDays((int) config('auth-system.remember_lifetime_days', 30)));
        Passport::personalAccessTokensExpireIn(now()->addMinutes((int) config('auth-system.session_lifetime_minutes', 480)));

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
