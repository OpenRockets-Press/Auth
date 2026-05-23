<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\Admin\WebhookEndpoint;
use App\Models\OAuth\App;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;

class WebhookController extends Controller
{
    public function index(Request $request): JsonResponse
    {
        $query = WebhookEndpoint::with('app');

        if ($request->has('app_id')) {
            $app = App::findOrFail($request->app_id);
            $this->authorize('view', $app);
            $query->where('app_id', $request->app_id);
        } else {
            $query->whereHas('app', function ($q) use ($request) {
                $q->where('owner_id', $request->user()->id)
                    ->orWhereHas('owner', function ($q) {
                        $q->whereHas('roles', function ($q) {
                            $q->whereJsonContains('permissions', 'webhooks.view_all');
                        });
                    });
            });
        }

        if ($request->has('is_active')) {
            $query->where('is_active', (bool) $request->is_active);
        }

        $endpoints = $query->latest()->paginate(20);

        return response()->json($endpoints);
    }

    public function store(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'app_id' => ['required', 'exists:apps,id'],
            'url' => ['required', 'url', 'max:2048'],
            'events' => ['required', 'array', 'min:1'],
            'events.*' => ['string'],
            'is_active' => ['boolean'],
        ]);

        $app = App::findOrFail($validated['app_id']);
        $this->authorize('manageWebhooks', $app);

        $this->validateWebhookUrl($validated['url']);

        $endpoint = WebhookEndpoint::create([
            'app_id' => $validated['app_id'],
            'url' => $validated['url'],
            'secret' => Str::random(64),
            'events' => $validated['events'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json([
            'id' => $endpoint->id,
            'app_id' => $endpoint->app_id,
            'url' => $endpoint->url,
            'events' => $endpoint->events,
            'is_active' => $endpoint->is_active,
            'secret' => $endpoint->secret,
            'created_at' => $endpoint->created_at,
        ], 201);
    }

    public function show(WebhookEndpoint $endpoint): JsonResponse
    {
        $this->authorize('view', $endpoint);

        return response()->json([
            'id' => $endpoint->id,
            'app_id' => $endpoint->app_id,
            'url' => $endpoint->url,
            'events' => $endpoint->events,
            'is_active' => $endpoint->is_active,
            'created_at' => $endpoint->created_at,
            'updated_at' => $endpoint->updated_at,
        ]);
    }

    public function update(Request $request, WebhookEndpoint $endpoint): JsonResponse
    {
        $this->authorize('update', $endpoint);

        $validated = $request->validate([
            'url' => ['sometimes', 'url', 'max:2048'],
            'events' => ['sometimes', 'array', 'min:1'],
            'events.*' => ['string'],
            'is_active' => ['boolean'],
        ]);

        if (isset($validated['url'])) {
            $this->validateWebhookUrl($validated['url']);
        }

        $endpoint->update($validated);

        return response()->json([
            'id' => $endpoint->id,
            'app_id' => $endpoint->app_id,
            'url' => $endpoint->url,
            'events' => $endpoint->events,
            'is_active' => $endpoint->is_active,
            'updated_at' => $endpoint->updated_at,
        ]);
    }

    public function regenerateSecret(WebhookEndpoint $endpoint): JsonResponse
    {
        $this->authorize('update', $endpoint);

        $endpoint->update(['secret' => Str::random(64)]);

        return response()->json([
            'message' => 'Webhook secret regenerated.',
            'secret' => $endpoint->secret,
        ]);
    }

    public function destroy(WebhookEndpoint $endpoint): JsonResponse
    {
        $this->authorize('delete', $endpoint);

        $endpoint->delete();

        return response()->json(['message' => 'Webhook endpoint deleted.']);
    }

    public function deliveries(WebhookEndpoint $endpoint, Request $request): JsonResponse
    {
        $this->authorize('view', $endpoint);

        $deliveries = $endpoint->deliveries()
            ->latest()
            ->paginate(50);

        return response()->json($deliveries);
    }

    protected function validateWebhookUrl(string $url): void
    {
        $parsed = parse_url($url);

        if (! isset($parsed['host'])) {
            throw new \InvalidArgumentException('Invalid webhook URL.');
        }

        $host = $parsed['host'];
        $blockedHosts = [
            'localhost',
            '127.0.0.1',
            '0.0.0.0',
            '::1',
            '0.0.0.0',
            '169.254.169.254',
            'metadata.google.internal',
        ];

        if (in_array($host, $blockedHosts, true)) {
            throw new \InvalidArgumentException('Webhook URL points to a blocked host.');
        }

        if (filter_var($host, FILTER_VALIDATE_IP)) {
            if (filter_var($host, FILTER_VALIDATE_IP, FILTER_FLAG_NO_PRIV_RANGE | FILTER_FLAG_NO_RES_RANGE) === false) {
                throw new \InvalidArgumentException('Webhook URL points to a private or reserved IP address.');
            }
        }
    }
}
