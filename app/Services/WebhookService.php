<?php

namespace App\Services;

use App\Jobs\DeliverWebhook;
use App\Models\Admin\WebhookDelivery;
use App\Models\Admin\WebhookEndpoint;
use Illuminate\Support\Facades\Queue;

class WebhookService
{
    public function dispatchEvent(string $eventType, array $payload): void
    {
        $endpoints = WebhookEndpoint::where('is_active', true)
            ->get()
            ->filter(fn ($endpoint) => $endpoint->handlesEvent($eventType));

        foreach ($endpoints as $endpoint) {
            $delivery = WebhookDelivery::create([
                'webhook_endpoint_id' => $endpoint->id,
                'event_type' => $eventType,
                'payload' => $payload,
                'status' => 'pending',
                'attempts' => 0,
            ]);

            Queue::connection(config('queue.default'))->push(
                new DeliverWebhook($delivery)
            );
        }
    }

    public function dispatchForApp(string $eventType, array $payload, int $appId): void
    {
        $endpoints = WebhookEndpoint::where('app_id', $appId)
            ->where('is_active', true)
            ->get()
            ->filter(fn ($endpoint) => $endpoint->handlesEvent($eventType));

        foreach ($endpoints as $endpoint) {
            $delivery = WebhookDelivery::create([
                'webhook_endpoint_id' => $endpoint->id,
                'event_type' => $eventType,
                'payload' => $payload,
                'status' => 'pending',
                'attempts' => 0,
            ]);

            Queue::connection(config('queue.default'))->push(
                new DeliverWebhook($delivery)
            );
        }
    }
}
