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
                $user->increment('failed_login_attempts');

                if ($user->failed_login_attempts >= config('auth-system.max_login_attempts', 5)) {
                    $user->update([
                        'locked_until' => now()->addMinutes(config('auth-system.lockout_duration', 60)),
                    ]);
                }

                $this->auditService->logLogin($user, 'password', false);
            }

            return response()->json(['message' => 'Invalid credentials.'], 401);
        }

        if ($user->isLocked()) {
            return response()->json([
                'message' => 'Account is temporarily locked.',
                'retry_after' => $user->locked_until->diffInSeconds(now()),
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

        $user->update([
            'last_login_at' => now(),
            'login_method' => 'password',
            'failed_login_attempts' => 0,
            'locked_until' => null,
        ]);

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
            'risk' => $risk['level'] === 'low' ? null : $risk,
        ]);
    }

    public function register(Request $request): JsonResponse
    {
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
        $user = $request->user()->load(['profile', 'roles']);

        return response()->json([
            'id' => $user->id,
            'name' => $user->name,
            'email' => $user->email,
            'email_verified_at' => $user->email_verified_at,
            'status' => $user->status,
            'last_login_at' => $user->last_login_at,
            'profile' => $user->profile,
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
}
