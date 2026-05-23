<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class VerifyWebhookSignature
{
    public function handle(Request $request, Closure $next): Response
    {
        $signature = $request->header('X-Webhook-Signature');

        if (! $signature) {
            return response()->json(['message' => 'Webhook signature missing.'], 401);
        }

        $payload = $request->getContent();

        [$algorithm, $signatureHash] = explode('=', $signature, 2) + [null, $signature];

        $secret = $request->header('X-Webhook-Secret') ?? config('services.webhook.secret');

        if (! $secret) {
            return response()->json(['message' => 'Webhook secret not configured.'], 500);
        }

        $expectedHash = hash_hmac($algorithm ?? 'sha256', $payload, $secret);

        if (! hash_equals($expectedHash, $signatureHash)) {
            return response()->json(['message' => 'Invalid webhook signature.'], 403);
        }

        return $next($request);
    }
}
