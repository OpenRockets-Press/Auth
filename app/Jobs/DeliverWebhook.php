<?php

namespace App\Jobs;

use App\Models\Admin\WebhookDelivery;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Http;

class DeliverWebhook implements ShouldQueue
{
    use Queueable;

    public $tries = 5;

    public $backoff = [60, 300, 900, 3600, 7200];

    public function __construct(
        public WebhookDelivery $delivery,
    ) {}

    public function handle(): void
    {
        $endpoint = $this->delivery->webhookEndpoint;

        if (! $endpoint || ! $endpoint->is_active) {
            $this->delivery->markFailed(0, 'Webhook endpoint is inactive or deleted.');

            return;
        }

        $payload = json_encode([
            'event' => $this->delivery->event_type,
            'data' => $this->delivery->payload,
            'timestamp' => now()->toIso8601String(),
        ]);

        $signature = $endpoint->generateSignature($payload);

        $this->delivery->incrementAttempts();

        try {
            $response = Http::timeout(config('auth-system.webhooks.timeout_seconds', 30))
                ->withHeaders([
                    'Content-Type' => 'application/json',
                    'X-Webhook-Signature' => 'sha256='.$signature,
                    'X-Webhook-Event' => $this->delivery->event_type,
                    'User-Agent' => 'Auth-System-Webhook/1.0',
                ])
                ->post($endpoint->url, json_decode($payload, true));

            if ($response->successful()) {
                $this->delivery->markDelivered($response->status(), $response->body());
            } else {
                if ($this->delivery->attempts >= $this->tries) {
                    $this->delivery->markFailed($response->status(), $response->body());

                    return;
                }

                $backoffIndex = min($this->delivery->attempts - 1, count($this->backoff) - 1);
                $this->release($this->backoff[$backoffIndex] ?? 3600);
            }
        } catch (\Exception $e) {
            if ($this->delivery->attempts >= $this->tries) {
                $this->delivery->markFailed(0, $e->getMessage());

                return;
            }

            $backoffIndex = min($this->delivery->attempts - 1, count($this->backoff) - 1);
            $this->release($this->backoff[$backoffIndex] ?? 3600);
        }
    }
}
