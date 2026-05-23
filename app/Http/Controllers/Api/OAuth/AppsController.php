<?php

namespace App\Http\Controllers\Api\OAuth;

use App\Http\Controllers\Controller;
use App\Http\Requests\OAuth\StoreAppRequest;
use App\Http\Requests\OAuth\UpdateAppRequest;
use App\Http\Resources\OAuth\AppResource;
use App\Http\Resources\OAuth\ConsentRecordResource;
use App\Models\OAuth\App;
use App\Services\OAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AppsController extends Controller
{
    public function __construct(
        protected OAuthService $oauthService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $query = App::with('owner')
            ->where('owner_id', $request->user()->id);

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        $apps = $query->latest()->paginate(20);

        return response()->json(AppResource::collection($apps));
    }

    public function store(StoreAppRequest $request): JsonResponse
    {
        $app = $this->oauthService->registerApp($request->user(), $request->validated());

        return response()->json(new AppResource($app), 201);
    }

    public function show(App $app): JsonResponse
    {
        $this->authorize('view', $app);

        $app->load('owner');

        return response()->json(new AppResource($app));
    }

    public function update(UpdateAppRequest $request, App $app): JsonResponse
    {
        $app = $this->oauthService->updateApp($app, $request->validated());

        return response()->json(new AppResource($app));
    }

    public function regenerateSecret(Request $request, App $app): JsonResponse
    {
        $this->authorize('update', $app);

        $validated = $request->validate([
            'confirm' => ['required', 'boolean', 'accepted'],
        ]);

        $secret = $this->oauthService->regenerateClientSecret($app);

        return response()->json([
            'message' => 'Client secret regenerated successfully.',
            'client_secret' => $secret,
        ]);
    }

    public function consents(Request $request, App $app): JsonResponse
    {
        $this->authorize('view', $app);

        $consents = $app->consentRecords()
            ->with('user')
            ->latest()
            ->paginate(20);

        return response()->json(ConsentRecordResource::collection($consents));
    }

    public function revokeConsents(Request $request, App $app): JsonResponse
    {
        $this->oauthService->revokeAllConsents($request->user(), $app);

        return response()->json(['message' => 'All consents revoked.']);
    }
}
