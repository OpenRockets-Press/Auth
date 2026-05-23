<?php

namespace App\Listeners;

use App\Events\OAuth\ConsentGranted;
use App\Services\WebhookService;

class TriggerConsentWebhooks
{
    public function __construct(
        protected WebhookService $webhookService,
    ) {}

    public function handle(ConsentGranted $event): void
    {
        $this->webhookService->dispatchForApp('oauth.consent.granted', [
            'user_id' => $event->user->id,
            'app_id' => $event->app->id,
            'scopes' => $event->scopes,
        ], $event->app->id);
    }
}
