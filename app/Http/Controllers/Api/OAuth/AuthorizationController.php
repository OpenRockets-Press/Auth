<?php

namespace App\Http\Controllers\Api\OAuth;

use App\Http\Controllers\Controller;
use App\Models\OAuth\App;
use App\Models\OAuth\ConsentRecord;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Laravel\Passport\Client;
use Laravel\Passport\Passport;

class AuthorizationController extends Controller
{
    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function startAuthorization(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => ['required', 'uuid', 'exists:oauth_clients,id'],
            'redirect_uri' => ['required', 'url'],
            'response_type' => ['required', 'string', 'in:code'],
            'scope' => ['nullable', 'string'],
            'state' => ['nullable', 'string', 'max:512'],
            'code_challenge' => ['nullable', 'string', 'max:128'],
            'code_challenge_method' => ['nullable', 'string', 'in:S256,plain'],
        ]);

        if (! Auth::check()) {
            return response()->json([
                'message' => 'Authentication required.',
                'login_url' => url('/api/auth/login'),
            ], 401);
        }

        $user = Auth::user();

        $client = Client::where('id', $validated['client_id'])
            ->where('revoked', false)
            ->first();

        if (! $client) {
            return response()->json(['message' => 'Invalid or revoked client.'], 400);
        }

        $app = App::where('client_id', $client->id)->first();

        if (! $app) {
            return response()->json(['message' => 'Application not found.'], 400);
        }

        if ($app->isSuspended() || $app->status === 'rejected') {
            return response()->json(['message' => 'Application is not active.'], 403);
        }

        $isRedirectValid = $this->validateRedirectUri($client, $validated['redirect_uri']);
        if (! $isRedirectValid) {
            return response()->json(['message' => 'Invalid redirect URI.'], 400);
        }

        if (empty($validated['code_challenge'])) {
            return response()->json([
                'message' => 'PKCE is required. Provide a code_challenge.',
                'error' => 'pkce_required',
                'error_uri' => 'https://datatracker.ietf.org/doc/html/rfc7636',
            ], 400);
        }

        $requestedScopes = [];
        if (! empty($validated['scope'])) {
            $requestedScopes = explode(' ', $validated['scope']);
        }

        $existingConsent = ConsentRecord::where('user_id', $user->id)
            ->where('app_id', $app->id)
            ->whereNull('revoked_at')
            ->first();

        if ($existingConsent) {
            $approvedScopes = $existingConsent->scopes;

            $missingScopes = array_diff($requestedScopes, $approvedScopes);
            if (empty($missingScopes) && ! empty($requestedScopes)) {
                return $this->generateAuthorizationCode(
                    $user->id,
                    $client->id,
                    $validated['redirect_uri'],
                    $validated['state'] ?? null,
                    $validated['code_challenge'],
                    $validated['code_challenge_method'] ?? 'S256',
                    $requestedScopes
                );
            }
        }

        return response()->json([
            'authorization_url' => url('/api/oauth/authorize'),
            'client' => [
                'id' => $app->id,
                'name' => $app->name,
                'icon_url' => $app->icon_url,
                'description' => $app->description,
                'homepage_url' => $app->homepage_url,
                'privacy_policy_url' => $app->privacy_policy_url,
            ],
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
            ],
            'requested_scopes' => $requestedScopes,
            'redirect_uri' => $validated['redirect_uri'],
            'state' => $validated['state'] ?? null,
            'consent_endpoint' => '/api/oauth/authorize/consent',
            'consent_method' => 'POST',
            'consent_body' => [
                'client_id' => 'uuid',
                'redirect_uri' => 'url',
                'response_type' => 'code',
                'scope' => 'space-separated scopes',
                'state' => 'original state (optional)',
                'code_challenge' => 'PKCE challenge (optional)',
                'code_challenge_method' => 'S256 or plain',
                'approve' => true,
            ],
        ], 200);
    }

    public function consent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'client_id' => ['required', 'uuid', 'exists:oauth_clients,id'],
            'redirect_uri' => ['required', 'url'],
            'response_type' => ['required', 'string', 'in:code'],
            'scope' => ['nullable', 'string'],
            'state' => ['nullable', 'string', 'max:512'],
            'code_challenge' => ['nullable', 'string', 'max:128'],
            'code_challenge_method' => ['nullable', 'string', 'in:S256,plain'],
            'approve' => ['required', 'boolean'],
        ]);

        if (! Auth::check()) {
            return response()->json(['message' => 'Authentication required.'], 401);
        }

        if (! $validated['approve']) {
            $redirectUrl = $validated['redirect_uri']
                .'?error=access_denied'
                .'&error_description=The+user+denied+the+request'
                .(! empty($validated['state']) ? '&state='.urlencode($validated['state']) : '');

            return response()->json([
                'message' => 'Authorization denied.',
                'redirect_url' => $redirectUrl,
            ], 200);
        }

        $user = Auth::user();

        $client = Client::where('id', $validated['client_id'])
            ->where('revoked', false)
            ->first();

        if (! $client) {
            return response()->json(['message' => 'Invalid client.'], 400);
        }

        $app = App::where('client_id', $client->id)->first();

        if (! $app) {
            return response()->json(['message' => 'Application not found.'], 400);
        }

        $isRedirectValid = $this->validateRedirectUri($client, $validated['redirect_uri']);
        if (! $isRedirectValid) {
            return response()->json(['message' => 'Invalid redirect URI.'], 400);
        }

        $requestedScopes = [];
        if (! empty($validated['scope'])) {
            $requestedScopes = explode(' ', $validated['scope']);
        }

        $existingConsent = ConsentRecord::where('user_id', $user->id)
            ->where('app_id', $app->id)
            ->whereNull('revoked_at')
            ->first();

        if ($existingConsent) {
            $existingConsent->update([
                'scopes' => array_unique(array_merge($existingConsent->scopes, $requestedScopes)),
            ]);
        } else {
            ConsentRecord::create([
                'user_id' => $user->id,
                'app_id' => $app->id,
                'scopes' => $requestedScopes,
                'consent_method' => 'oauth_authorization',
                'ip_address' => $request->ip(),
                'user_agent' => $request->userAgent(),
                'granted_at' => now(),
            ]);

            $this->auditService->logConsentGranted($user, $app, $requestedScopes);
        }

        return $this->generateAuthorizationCode(
            $user->id,
            $client->id,
            $validated['redirect_uri'],
            $validated['state'] ?? null,
            $validated['code_challenge'],
            $validated['code_challenge_method'] ?? 'S256',
            $requestedScopes
        );
    }

    protected function generateAuthorizationCode(
        string $userId,
        string $clientId,
        string $redirectUri,
        ?string $state,
        ?string $codeChallenge,
        string $codeChallengeMethod,
        array $scopes
    ): JsonResponse {
        $authCode = Passport::authCode()->create([
            'id' => \Illuminate\Support\Str::random(80),
            'user_id' => $userId,
            'client_id' => $clientId,
            'scopes' => empty($scopes) ? null : implode(' ', $scopes),
            'revoked' => false,
            'expires_at' => now()->addMinutes(10),
        ]);

        $redirectParams = 'code='.urlencode($authCode->id)
            .'&iss='.urlencode(config('app.url'));

        if ($state) {
            $redirectParams .= '&state='.urlencode($state);
        }

        $redirectUrl = $redirectUri.'?'.$redirectParams;

        return response()->json([
            'message' => 'Authorization granted.',
            'redirect_url' => $redirectUrl,
            'code' => $authCode->id,
            'state' => $state,
            'expires_in' => 600,
        ], 201);
    }

    protected function validateRedirectUri(Client $client, string $redirectUri): bool
    {
        $allowedUris = (array) $client->redirect_uris;

        if (in_array($redirectUri, $allowedUris, true)) {
            return true;
        }

        $parsed = parse_url($redirectUri);
        $redirectScheme = strtolower($parsed['scheme'] ?? '');
        $redirectHost = strtolower($parsed['host'] ?? '');
        $redirectPort = $parsed['port'] ?? null;
        $redirectPath = $parsed['path'] ?? '/';

        foreach ($allowedUris as $allowed) {
            $allowedParsed = parse_url($allowed);
            $allowedScheme = strtolower($allowedParsed['scheme'] ?? '');
            $allowedHost = strtolower($allowedParsed['host'] ?? '');
            $allowedPort = $allowedParsed['port'] ?? null;
            $allowedPath = $allowedParsed['path'] ?? '/';

            if ($redirectScheme !== $allowedScheme) {
                continue;
            }

            if ($redirectHost !== $allowedHost) {
                continue;
            }

            if ($redirectPort !== $allowedPort) {
                continue;
            }

            if (str_starts_with($redirectPath, $allowedPath)) {
                return true;
            }
        }

        return false;
    }
}
