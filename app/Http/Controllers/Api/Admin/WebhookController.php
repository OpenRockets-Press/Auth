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
            $query->where('app_id', $request->app_id);
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
            'app_id' => ['nullable', 'exists:apps,id'],
            'url' => ['required', 'url', 'max:2048'],
            'events' => ['required', 'array', 'min:1'],
            'events.*' => ['string'],
            'is_active' => ['boolean'],
        ]);

        $endpoint = WebhookEndpoint::create([
            'app_id' => $validated['app_id'] ?? null,
            'url' => $validated['url'],
            'secret' => Str::random(64),
            'events' => $validated['events'],
            'is_active' => $validated['is_active'] ?? true,
        ]);

        return response()->json($endpoint, 201);
    }

    public function show(WebhookEndpoint $endpoint): JsonResponse
    {
        return response()->json($endpoint->load('app'));
    }

    public function update(Request $request, WebhookEndpoint $endpoint): JsonResponse
    {
        $validated = $request->validate([
            'url' => ['sometimes', 'url', 'max:2048'],
            'events' => ['sometimes', 'array', 'min:1'],
            'events.*' => ['string'],
            'is_active' => ['boolean'],
        ]);

        $endpoint->update($validated);

        return response()->json($endpoint);
    }

    public function regenerateSecret(WebhookEndpoint $endpoint): JsonResponse
    {
        $endpoint->update(['secret' => Str::random(64)]);

        return response()->json([
            'message' => 'Webhook secret regenerated.',
            'secret' => $endpoint->secret,
        ]);
    }

    public function destroy(WebhookEndpoint $endpoint): JsonResponse
    {
        $endpoint->delete();

        return response()->json(['message' => 'Webhook endpoint deleted.']);
    }

    public function deliveries(WebhookEndpoint $endpoint, Request $request): JsonResponse
    {
        $deliveries = $endpoint->deliveries()
            ->latest()
            ->paginate(50);

        return response()->json($deliveries);
    }
}
