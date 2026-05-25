<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Compliance\Country;
use App\Services\AuditService;
use Carbon\Carbon;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class OnboardingController extends Controller
{
    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function getStatus(Request $request): JsonResponse
    {
        $user = $request->user();
        $profile = $user->profile;

        return response()->json([
            'onboarding_status' => $profile?->onboarding_status ?? 'incomplete',
            'onboarding_completed_at' => $profile?->onboarding_completed_at,
            'profile' => $profile ? [
                'country_code' => $profile->country_code,
                'state' => $profile->state,
                'city' => $profile->city,
                'date_of_birth' => $profile->date_of_birth?->format('Y-m-d'),
            ] : null,
            'required_fields' => ['country_code', 'state', 'date_of_birth'],
            'optional_fields' => ['city'],
        ]);
    }

    public function complete(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'country_code' => ['required', 'string', 'size:2', 'exists:countries,code'],
            'state' => ['required', 'string', 'max:255'],
            'date_of_birth' => ['required', 'date', 'before:today', 'after:1900-01-01'],
            'city' => ['nullable', 'string', 'max:255'],
        ]);

        $user = $request->user();
        $country = Country::findOrFail($validated['country_code']);

        $age = Carbon::parse($validated['date_of_birth'])->diffInYears(now());
        $needsConsent = $country->requiresParentalConsent($age);

        $profile = $user->profile ?? new \App\Models\Compliance\UserProfile;
        $profile->user_id = $user->id;
        $profile->country_code = $validated['country_code'];
        $profile->state = $validated['state'];
        $profile->city = $validated['city'] ?? null;
        $profile->date_of_birth = $validated['date_of_birth'];
        $profile->age_verified = true;
        $profile->age_verification_method = 'self_declared';
        $profile->parental_consent_required = $needsConsent;
        $profile->parental_consent_status = $needsConsent ? 'pending' : 'not_required';
        $profile->onboarding_status = 'completed';
        $profile->onboarding_completed_at = now();
        $profile->save();

        $this->auditService->log('onboarding.completed', $user, data: [
            'country_code' => $validated['country_code'],
            'state' => $validated['state'],
        ]);

        return response()->json([
            'message' => 'Onboarding completed successfully.',
            'onboarding_status' => 'completed',
            'parental_consent_required' => $needsConsent,
            'parental_consent_status' => $profile->parental_consent_status,
        ]);
    }
}
