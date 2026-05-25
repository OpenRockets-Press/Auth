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
        $result = $this->oauthService->registerApp($request->user(), $request->validated());

        return response()->json(array_merge(
            (new AppResource($result['app']))->resolve(),
            [
                'client_id' => $result['client_id'],
                'client_secret' => $result['client_secret'],
                'client_secret_preview' => substr($result['client_secret'], 0, 8).'...',
            ]
        ), 201);
    }

    public function show(App $app): JsonResponse
    {
        $this->authorize('view', $app);

        $app->load('owner');

        return response()->json(new AppResource($app));
    }

    public function update(UpdateAppRequest $request, App $app): JsonResponse
    {
        $this->authorize('update', $app);

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
        $this->authorize('view', $app);

        $this->oauthService->revokeAllConsents($request->user(), $app);

        return response()->json(['message' => 'All consents revoked.']);
    }

    public function scopes(Request $request, App $app): JsonResponse
    {
        $this->authorize('view', $app);

        $scopes = $app->scopes()->orderBy('name')->get();

        return response()->json([
            'scopes' => $scopes->map(fn ($scope) => [
                'id' => $scope->id,
                'name' => $scope->name,
                'description' => $scope->description,
                'is_required' => $scope->is_required,
            ]),
        ]);
    }

    public function stats(Request $request, App $app): JsonResponse
    {
        $this->authorize('view', $app);

        $stats = [
            'total_consents' => $app->consentRecords()->whereNull('revoked_at')->count(),
            'active_consents' => $app->consentRecords()->whereNull('revoked_at')->count(),
            'revoked_consents' => $app->consentRecords()->whereNotNull('revoked_at')->count(),
            'total_scopes' => $app->scopes()->count(),
            'created_at' => $app->created_at,
            'last_consent_at' => $app->consentRecords()->latest()->value('granted_at'),
        ];

        return response()->json($stats);
    }
}
