<?php

namespace App\Listeners;

use App\Events\OAuth\ConsentRevoked;
use App\Services\WebhookService;

class TriggerConsentRevokedWebhooks
{
    public function __construct(
        protected WebhookService $webhookService,
    ) {}

    public function handle(ConsentRevoked $event): void
    {
        $this->webhookService->dispatchForApp('oauth.consent.revoked', [
            'user_id' => $event->user->id,
            'app_id' => $event->app->id,
        ], $event->app->id);
    }
}
