<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Fortify\Contracts\TwoFactorAuthenticationProvider;
use PragmaRX\Google2FA\Google2FA;

class TwoFactorController extends Controller
{
    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function enable(Request $request): JsonResponse
    {
        $user = $request->user();

        if ($user->two_factor_secret) {
            return response()->json(['message' => '2FA is already enabled.'], 400);
        }

        $provider = app(TwoFactorAuthenticationProvider::class);
        $secret = $provider->generateSecretKey();
        $user->two_factor_secret = encrypt($secret);
        $user->save();

        $this->auditService->logTwoFactorSetup($user);

        return response()->json([
            'secret' => $secret,
            'qr_code_url' => $this->getQrCodeUrl($user, $secret),
        ]);
    }

    public function confirm(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'code' => ['required', 'string', 'digits:6'],
        ]);

        $user = $request->user();

        if (! $user->two_factor_secret) {
            return response()->json(['message' => '2FA is not enabled.'], 400);
        }

        $secret = decrypt($user->two_factor_secret);
        $g2fa = new Google2FA;

        $valid = $g2fa->verifyKey($secret, $validated['code']);

        if (! $valid) {
            return response()->json(['message' => 'Invalid code.'], 422);
        }

        $user->two_factor_confirmed_at = now();
        $user->save();

        return response()->json(['message' => '2FA confirmed and enabled.']);
    }

    public function disable(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->two_factor_secret) {
            return response()->json(['message' => '2FA is not enabled.'], 400);
        }

        $user->two_factor_secret = null;
        $user->two_factor_confirmed_at = null;
        $user->save();

        $this->auditService->logTwoFactorRemoved($user);

        return response()->json(['message' => '2FA disabled.']);
    }

    public function recoveryCodes(Request $request): JsonResponse
    {
        $user = $request->user();

        if (! $user->two_factor_secret) {
            return response()->json(['message' => '2FA is not enabled.'], 400);
        }

        $codes = $user->recoveryCodes();

        return response()->json(['recovery_codes' => $codes]);
    }

    protected function getQrCodeUrl($user, string $secret): string
    {
        $g2fa = new Google2FA;

        return $g2fa->getQRCodeUrl(
            config('app.name'),
            $user->email,
            $secret
        );
    }
}
