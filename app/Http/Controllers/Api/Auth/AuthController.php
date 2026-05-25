<?php

namespace App\Http\Controllers\Api\Auth;

use App\Events\Security\UserLoggedIn;
use App\Events\Security\UserLoggedOut;
use App\Http\Controllers\Controller;
use App\Models\User;
use App\Services\AuditService;
use App\Services\RiskAssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\RateLimiter;

class AuthController extends Controller
{
    public function __construct(
        protected AuditService $auditService,
        protected RiskAssessmentService $riskService,
    ) {}

    public function login(Request $request): JsonResponse
    {
        $credentials = $request->validate([
            'email' => ['required', 'email'],
            'password' => ['required', 'string'],
        ]);

        $user = User::where('email', $credentials['email'])->first();

        if (! $user || ! Hash::check($credentials['password'], $user->password)) {
            if ($user) {
                $maxAttempts = config('auth-system.max_login_attempts', 5);
                $lockoutDuration = config('auth-system.lockout_duration', 60);

                $affected = \Illuminate\Support\Facades\DB::table('users')
                    ->where('id', $user->id)
                    ->where(function ($q) {
                        $q->whereNull('locked_until')
                            ->orWhere('locked_until', '<=', now());
                    })
                    ->update([
                        'failed_login_attempts' => \Illuminate\Support\Facades\DB::raw('failed_login_attempts + 1'),
                    ]);

                $user->refresh();

                if ($affected && $user->failed_login_attempts >= $maxAttempts) {
                    \Illuminate\Support\Facades\DB::table('users')
                        ->where('id', $user->id)
                        ->update([
                            'locked_until' => now()->addMinutes($lockoutDuration),
                        ]);

                    $user->refresh();
                }

                $this->auditService->logLogin($user, 'password', false);
            }

            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if ($user->isLocked()) {
            return response()->json([
                'message' => 'Account is temporarily locked. Please try again later.',
            ], 429);
        }

        if ($user->status === 'suspended') {
            return response()->json(['message' => 'Account has been suspended.'], 403);
        }

        $risk = $this->riskService->assessLoginRisk(
            $user,
            $request->ip(),
            $request->userAgent()
        );

        \Illuminate\Support\Facades\DB::table('users')
            ->where('id', $user->id)
            ->update([
                'last_login_at' => now(),
                'login_method' => 'password',
                'failed_login_attempts' => 0,
                'locked_until' => null,
            ]);

        $user->refresh();

        $token = $user->createToken('login-token');

        event(new UserLoggedIn(
            $user,
            'password',
            $request->ip(),
            $request->userAgent()
        ));

        return response()->json([
            'access_token' => $token->accessToken,
            'token_type' => 'Bearer',
            'expires_in' => config('auth-system.session_lifetime_minutes', 480) * 60,
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'risk' => $risk['level'] === 'low' ? null : [
                'level' => $risk['level'],
                'require_step_up' => $risk['require_step_up'] ?? false,
            ],
        ]);
    }

    public function register(Request $request): JsonResponse
    {
        $throttleKey = 'register:'.$request->ip();
        $maxAttempts = 3;

        if (RateLimiter::tooManyAttempts($throttleKey, $maxAttempts)) {
            return response()->json([
                'message' => 'Too many registration attempts. Please try again later.',
                'retry_after' => RateLimiter::availableIn($throttleKey),
            ], 429);
        }

        RateLimiter::hit($throttleKey, 3600);

        $validated = $request->validate([
            'name' => ['required', 'string', 'max:255'],
            'email' => ['required', 'email', 'unique:users,email'],
            'password' => ['required', 'string', 'min:8', 'confirmed'],
        ]);

        $user = User::create([
            'name' => $validated['name'],
            'email' => $validated['email'],
            'password' => Hash::make($validated['password']),
        ]);

        $this->auditService->logRegistration($user);

        $token = $user->createToken('registration-token');

        return response()->json([
            'access_token' => $token->accessToken,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ], 201);
    }

    public function logout(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        event(new UserLoggedOut($request->user()));

        return response()->json(['message' => 'Logged out successfully.']);
    }

    public function me(Request $request): JsonResponse
    {
        $user = $request->user()->load(['profile.country', 'roles']);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'status' => $user->status,
            'last_login_at' => $user->last_login_at,
            'two_factor_enabled' => $user->two_factor_confirmed_at !== null,
            'onboarding_completed' => $user->hasCompletedOnboarding(),
            'profile' => $user->profile ? [
                'date_of_birth' => $user->profile->date_of_birth?->format('Y-m-d'),
                'country_code' => $user->profile->country_code,
                'country_name' => $user->profile->country?->name,
                'state' => $user->profile->state,
                'city' => $user->profile->city,
                'age_verified' => $user->profile->age_verified,
                'parental_consent_required' => $user->profile->parental_consent_required,
                'parental_consent_status' => $user->profile->parental_consent_status,
                'onboarding_status' => $user->profile->onboarding_status,
            ] : null,
            'roles' => $user->roles->pluck('name'),
            'created_at' => $user->created_at,
        ]);
    }

    public function revokeAllTokens(Request $request): JsonResponse
    {
        $user = $request->user();
        $currentTokenId = $user->currentAccessToken()->id;

        $user->tokens()->where('id', '!=', $currentTokenId)->delete();

        return response()->json(['message' => 'All other tokens revoked.']);
    }

    public function complianceStatus(Request $request): JsonResponse
    {
        $user = $request->user()->load('profile.country');
        $profile = $user->profile;

        return response()->json([
            'has_profile' => $profile !== null,
            'is_minor' => $user->isMinor(),
            'parental_consent_required' => $profile?->parental_consent_required ?? false,
            'parental_consent_status' => $profile?->parental_consent_status,
            'age_verified' => $profile?->age_verified ?? false,
            'country_code' => $profile?->country_code,
            'country_name' => $profile?->country?->name,
            'can_proceed' => ! $profile || $profile->hasConsent(),
        ]);
    }
}
