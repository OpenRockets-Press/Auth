<?php

namespace App\Http\Controllers\Api\OAuth;

use App\Http\Controllers\Controller;
use App\Http\Requests\OAuth\GrantConsentRequest;
use App\Http\Resources\OAuth\ConsentRecordResource;
use App\Models\OAuth\App;
use App\Models\OAuth\ConsentRecord;
use App\Services\OAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ConsentController extends Controller
{
    public function __construct(
        protected OAuthService $oauthService,
    ) {}

    public function grant(GrantConsentRequest $request, App $app): JsonResponse
    {
        $record = $this->oauthService->grantConsent(
            $request->user(),
            $app,
            $request->scopes,
            'oauth_screen'
        );

        return response()->json(new ConsentRecordResource($record), 201);
    }

    public function revoke(Request $request, ConsentRecord $record): JsonResponse
    {
        $this->authorize('revoke', $record);

        $this->oauthService->revokeConsent($record);

        return response()->json(['message' => 'Consent revoked.']);
    }

    public function myConsents(Request $request): JsonResponse
    {
        $consents = ConsentRecord::where('user_id', $request->user()->id)
            ->with('app')
            ->latest()
            ->paginate(20);

        return response()->json(ConsentRecordResource::collection($consents));
    }
}
