<?php

namespace App\Http\Controllers\Api\DataHub;

use App\Http\Controllers\Controller;
use App\Http\Requests\DataHub\ExchangeTokenRequest;
use App\Http\Requests\DataHub\RequestDataSharingRequest;
use App\Http\Requests\DataHub\StoreDataRequest;
use App\Http\Resources\DataHub\DataRequestResource;
use App\Http\Resources\DataHub\DataSharingAgreementResource;
use App\Models\DataHub\DataRequest;
use App\Models\OAuth\App;
use App\Services\DataHubService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class DataHubController extends Controller
{
    public function __construct(
        protected DataHubService $dataHubService,
    ) {}

    public function store(StoreDataRequest $request, App $app): JsonResponse
    {
        $store = $this->dataHubService->storeData(
            $request->user(),
            $app,
            $request->key,
            $request->value
        );

        return response()->json([
            'message' => 'Data stored successfully.',
            'key' => $store->key,
        ], 201);
    }

    public function show(Request $request, App $app, string $key): JsonResponse
    {
        $value = $this->dataHubService->getData($request->user(), $app, $key);

        if ($value === null) {
            return response()->json(['message' => 'Data not found.'], 404);
        }

        return response()->json(['key' => $key, 'value' => $value]);
    }

    public function index(Request $request, App $app): JsonResponse
    {
        $data = $this->dataHubService->getAllData($request->user(), $app);

        return response()->json(['data' => $data]);
    }

    public function destroy(Request $request, App $app, string $key): JsonResponse
    {
        $deleted = $this->dataHubService->deleteData($request->user(), $app, $key);

        if (! $deleted) {
            return response()->json(['message' => 'Data not found.'], 404);
        }

        return response()->json(['message' => 'Data deleted.']);
    }

    public function requestSharing(RequestDataSharingRequest $request, App $app): JsonResponse
    {
        $targetApp = App::findOrFail($request->target_app_id);

        $dataRequest = $this->dataHubService->requestDataSharing(
            $request->user(),
            $app,
            $targetApp,
            $request->data_keys
        );

        return response()->json(new DataRequestResource($dataRequest), 201);
    }

    public function grantConsent(Request $request, DataRequest $dataRequest): JsonResponse
    {
        if ($dataRequest->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $agreement = $this->dataHubService->grantDataSharingConsent($dataRequest);

        return response()->json(new DataSharingAgreementResource($agreement));
    }

    public function denyConsent(Request $request, DataRequest $dataRequest): JsonResponse
    {
        if ($dataRequest->user_id !== $request->user()->id) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        $this->dataHubService->denyDataSharingConsent($dataRequest);

        return response()->json(['message' => 'Data sharing consent denied.']);
    }

    public function exchangeToken(ExchangeTokenRequest $request, App $app): JsonResponse
    {
        $grantingApp = App::findOrFail($request->granting_app_id);

        $token = $this->dataHubService->exchangeToken(
            $request->user(),
            $app,
            $grantingApp,
            $request->scopes
        );

        return response()->json([
            'access_token' => $token->token,
            'token_type' => 'Bearer',
            'expires_at' => $token->expires_at,
        ]);
    }

    public function accessData(Request $request, string $userId): JsonResponse
    {
        $token = $request->bearerToken();

        if (! $token) {
            return response()->json(['message' => 'Access token required.'], 401);
        }

        $dataToken = $this->dataHubService->validateDataAccessToken($token);

        if (! $dataToken) {
            return response()->json(['message' => 'Invalid or expired token.'], 401);
        }

        if ($userId !== (string) $dataToken->user_id) {
            return response()->json(['message' => 'Token does not authorize access to this user data.'], 403);
        }

        $requestedKeys = $request->query('keys');
        if ($requestedKeys) {
            $requestedKeys = is_array($requestedKeys) ? $requestedKeys : explode(',', $requestedKeys);
            $unauthorizedKeys = array_diff($requestedKeys, $dataToken->scopes);

            if (! empty($unauthorizedKeys)) {
                return response()->json([
                    'message' => 'Token does not authorize access to requested keys.',
                    'unauthorized_keys' => $unauthorizedKeys,
                ], 403);
            }
        }

        $data = $this->dataHubService->accessSharedData($dataToken, $userId, $requestedKeys);

        return response()->json(['data' => $data]);
    }

    public function myAgreements(Request $request): JsonResponse
    {
        $agreements = $request->user()->dataSharingAgreements()
            ->with(['sourceApp', 'targetApp'])
            ->latest()
            ->paginate(20);

        return response()->json(DataSharingAgreementResource::collection($agreements));
    }

    public function revokeAgreement(Request $request, int $agreementId): JsonResponse
    {
        $agreement = $request->user()->dataSharingAgreements()->findOrFail($agreementId);

        $this->dataHubService->revokeDataSharingAgreement($agreement);

        return response()->json(['message' => 'Data sharing agreement revoked.']);
    }
}
