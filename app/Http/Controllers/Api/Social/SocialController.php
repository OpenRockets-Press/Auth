<?php

namespace App\Http\Controllers\Api\Social;

use App\Http\Controllers\Controller;
use App\Models\DataHub\SocialAccount;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Str;
use Laravel\Socialite\Facades\Socialite;

class SocialController extends Controller
{
    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function redirect(string $provider): JsonResponse
    {
        if (! config("services.{$provider}.client_id")) {
            return response()->json(['message' => 'Social provider not configured.'], 400);
        }

        $url = Socialite::driver($provider)->stateless()->redirect()->getTargetUrl();

        return response()->json(['redirect_url' => $url]);
    }

    public function callback(string $provider, Request $request): JsonResponse
    {
        if (! $request->has('code')) {
            return response()->json(['message' => 'Authorization code missing.'], 400);
        }

        $socialUser = Socialite::driver($provider)->stateless()->user();

        if (! $socialUser->getEmail()) {
            return response()->json([
                'message' => 'Social provider did not return an email address.',
            ], 400);
        }

        $emailVerified = $this->isProviderEmailVerified($provider, $socialUser);

        $socialAccount = SocialAccount::where('provider', $provider)
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($socialAccount) {
            $user = $socialAccount->user;
        } else {
            $user = User::where('email', $socialUser->getEmail())->first();

            if ($user) {
                if (! $emailVerified && ! $user->email_verified_at) {
                    return response()->json([
                        'message' => 'An account with this email exists but is not verified. Please verify your email first.',
                    ], 409);
                }

                $user->socialAccounts()->create([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'access_token' => encrypt($socialUser->token),
                    'refresh_token' => $socialUser->refreshToken ? encrypt($socialUser->refreshToken) : null,
                    'token_expires_at' => $socialUser->expiresIn ? now()->addSeconds($socialUser->expiresIn) : null,
                    'avatar_url' => $socialUser->getAvatar(),
                    'email' => $socialUser->getEmail(),
                    'name' => $socialUser->getName(),
                    'linked_at' => now(),
                ]);

                if (! $user->email_verified_at && $emailVerified) {
                    $user->update(['email_verified_at' => now()]);
                }

                $this->auditService->logSocialAccountLinked($user, $provider);
            } else {
                if (! $emailVerified) {
                    return response()->json([
                        'message' => 'Email address not verified by social provider. Cannot create account.',
                    ], 400);
                }

                $user = User::create([
                    'name' => $socialUser->getName() ?? $socialUser->getNickname() ?? 'User',
                    'email' => $socialUser->getEmail(),
                    'password' => Str::random(32),
                    'email_verified_at' => now(),
                ]);

                $user->socialAccounts()->create([
                    'provider' => $provider,
                    'provider_id' => $socialUser->getId(),
                    'access_token' => encrypt($socialUser->token),
                    'refresh_token' => $socialUser->refreshToken ? encrypt($socialUser->refreshToken) : null,
                    'token_expires_at' => $socialUser->expiresIn ? now()->addSeconds($socialUser->expiresIn) : null,
                    'avatar_url' => $socialUser->getAvatar(),
                    'email' => $socialUser->getEmail(),
                    'name' => $socialUser->getName(),
                    'linked_at' => now(),
                ]);

                $this->auditService->logRegistration($user);
                $this->auditService->logSocialAccountLinked($user, $provider);
            }
        }

        $token = $user->createToken('social-login-'.$provider);

        return response()->json([
            'access_token' => $token->accessToken,
            'token_type' => 'Bearer',
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
        ]);
    }

    protected function isProviderEmailVerified(string $provider, $socialUser): bool
    {
        $verifiedProviders = ['google', 'apple', 'microsoft', 'facebook'];

        if (in_array($provider, $verifiedProviders, true)) {
            return true;
        }

        if (method_exists($socialUser, 'getEmailVerified')) {
            return (bool) $socialUser->getEmailVerified();
        }

        return false;
    }

    public function link(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'provider' => ['required', 'string', 'in:google,apple,github,microsoft,facebook,twitter'],
            'code' => ['required', 'string'],
        ]);

        $socialUser = Socialite::driver($validated['provider'])
            ->stateless()
            ->userFromCode($validated['code']);

        $existing = SocialAccount::where('provider', $validated['provider'])
            ->where('provider_id', $socialUser->getId())
            ->first();

        if ($existing) {
            return response()->json(['message' => 'This social account is already linked.'], 409);
        }

        $request->user()->socialAccounts()->create([
            'provider' => $validated['provider'],
            'provider_id' => $socialUser->getId(),
            'access_token' => encrypt($socialUser->token),
            'refresh_token' => $socialUser->refreshToken ? encrypt($socialUser->refreshToken) : null,
            'token_expires_at' => $socialUser->expiresIn ? now()->addSeconds($socialUser->expiresIn) : null,
            'avatar_url' => $socialUser->getAvatar(),
            'email' => $socialUser->getEmail(),
            'name' => $socialUser->getName(),
            'linked_at' => now(),
        ]);

        $this->auditService->logSocialAccountLinked($request->user(), $validated['provider']);

        return response()->json(['message' => 'Social account linked.']);
    }

    public function unlink(Request $request, string $provider): JsonResponse
    {
        $account = $request->user()->socialAccounts()
            ->where('provider', $provider)
            ->first();

        if (! $account) {
            return response()->json(['message' => 'Social account not linked.'], 404);
        }

        $account->delete();

        $this->auditService->logSocialAccountUnlinked($request->user(), $provider);

        return response()->json(['message' => 'Social account unlinked.']);
    }

    public function linkedAccounts(Request $request): JsonResponse
    {
        $accounts = $request->user()->socialAccounts()->get()->map(fn ($a) => [
            'provider' => $a->provider,
            'email' => $a->email,
            'name' => $a->name,
            'avatar_url' => $a->avatar_url,
            'linked_at' => $a->linked_at,
        ]);

        return response()->json(['accounts' => $accounts]);
    }
}
