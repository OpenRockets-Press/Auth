<?php

namespace App\Http\Controllers\Api\Compliance;

use App\Events\Compliance\DataDeletionRequested;
use App\Events\Compliance\DataExportRequested;
use App\Events\Compliance\ParentalConsentRequested;
use App\Http\Controllers\Controller;
use App\Http\Requests\Compliance\RequestParentalConsentRequest;
use App\Http\Requests\Compliance\RespondToParentalConsentRequest;
use App\Http\Requests\Compliance\StoreUserProfileRequest;
use App\Http\Resources\Compliance\CountryResource;
use App\Http\Resources\Compliance\DataAccessRequestResource;
use App\Http\Resources\Compliance\UserProfileResource;
use App\Models\Compliance\Country;
use App\Services\ComplianceService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class ComplianceController extends Controller
{
    public function __construct(
        protected ComplianceService $complianceService,
    ) {}

    public function country(string $code): JsonResponse
    {
        $country = Country::findOrFail($code);

        return response()->json(new CountryResource($country));
    }

    public function countries(): JsonResponse
    {
        $countries = Country::orderBy('name')->get();

        return response()->json(CountryResource::collection($countries));
    }

    public function profile(StoreUserProfileRequest $request): JsonResponse
    {
        $profile = $this->complianceService->evaluateUserProfile(
            $request->user(),
            $request->country_code,
            $request->date_of_birth
        );

        return response()->json(new UserProfileResource($profile), 201);
    }

    public function getProfile(Request $request): JsonResponse
    {
        $profile = $request->user()->profile;

        if (! $profile) {
            return response()->json(['message' => 'Profile not set.'], 404);
        }

        return response()->json(new UserProfileResource($profile));
    }

    public function requestParentalConsent(RequestParentalConsentRequest $request): JsonResponse
    {
        $consent = $this->complianceService->requestParentalConsent(
            $request->user(),
            $request->parent_email,
            $request->parent_name
        );

        event(new ParentalConsentRequested($request->user(), $consent));

        return response()->json([
            'message' => 'Parental consent request sent.',
            'consent_id' => $consent->id,
        ], 201);
    }

    public function respondToParentalConsent(string $token, RespondToParentalConsentRequest $request): JsonResponse
    {
        $consent = $this->complianceService->respondToParentalConsent($token, $request->action);

        return response()->json([
            'message' => $request->action === 'grant'
                ? 'Consent granted successfully.'
                : 'Consent denied.',
            'consent_status' => $consent->consent_status,
        ]);
    }

    public function requestDataExport(Request $request): JsonResponse
    {
        $dataRequest = $this->complianceService->requestDataExport($request->user());

        event(new DataExportRequested($request->user()));

        return response()->json(new DataAccessRequestResource($dataRequest), 201);
    }

    public function requestDataDeletion(Request $request): JsonResponse
    {
        $dataRequest = $this->complianceService->requestDataDeletion($request->user());

        event(new DataDeletionRequested($request->user()));

        return response()->json(new DataAccessRequestResource($dataRequest), 201);
    }

    public function dataRequests(Request $request): JsonResponse
    {
        $requests = $request->user()->dataAccessRequests()
            ->latest()
            ->paginate(20);

        return response()->json(DataAccessRequestResource::collection($requests));
    }
}
