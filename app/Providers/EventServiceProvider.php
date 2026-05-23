<?php

namespace App\Providers;

use App\Events\Compliance\ParentalConsentRequested;
use App\Events\OAuth\ConsentGranted;
use App\Events\OAuth\ConsentRevoked;
use App\Events\Security\UserLoggedIn;
use App\Events\Security\UserLoggedOut;
use App\Listeners\LogUserLogin;
use App\Listeners\LogUserLogout;
use App\Listeners\SendParentalConsentNotification;
use App\Listeners\TriggerConsentRevokedWebhooks;
use App\Listeners\TriggerConsentWebhooks;
use Illuminate\Foundation\Support\Providers\EventServiceProvider as ServiceProvider;

class EventServiceProvider extends ServiceProvider
{
    protected $listen = [
        UserLoggedIn::class => [
            LogUserLogin::class,
        ],
        UserLoggedOut::class => [
            LogUserLogout::class,
        ],
        ConsentGranted::class => [
            TriggerConsentWebhooks::class,
        ],
        ConsentRevoked::class => [
            TriggerConsentRevokedWebhooks::class,
        ],
        ParentalConsentRequested::class => [
            SendParentalConsentNotification::class,
        ],
    ];

    public function boot(): void
    {
        //
    }
}
