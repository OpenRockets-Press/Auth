<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSignature
{
    protected const ALLOWED_ALGORITHM = 'sha256';

    public function handle(Request $request, Closure $next): Response
    {
        $signature = $request->header('X-Webhook-Signature');

        if (! $signature) {
            return response()->json(['message' => 'Invalid signature.'], 401);
        }

        $payload = $request->getContent();

        [$algorithm, $signatureHash] = explode('=', $signature, 2) + [null, $signature];

        if ($algorithm !== self::ALLOWED_ALGORITHM) {
            return response()->json(['message' => 'Invalid signature algorithm.'], 401);
        }

        $secret = config('services.webhook.secret');

        if (! $secret) {
            return response()->json(['message' => 'Service unavailable.'], 500);
        }

        $expectedHash = hash_hmac(self::ALLOWED_ALGORITHM, $payload, $secret);

        if (! hash_equals($expectedHash, $signatureHash)) {
            return response()->json(['message' => 'Invalid signature.'], 403);
        }

        return $next($request);
    }
}
