<?php

namespace App\Http\Middleware;

use App\Models\Admin\ApiKey;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuthenticateWithApiKey
{
    public function handle(Request $request, Closure $next): Response
    {
        $key = $request->header('X-API-Key') ?? $request->query('api_key');

        if (! $key) {
            return response()->json(['message' => 'API key required.'], 401);
        }

        $apiKey = ApiKey::findByPlainKey($key);

        if (! $apiKey || ! $apiKey->isValid()) {
            return response()->json(['message' => 'Invalid or expired API key.'], 401);
        }

        $apiKey->touchUsage();

        $request->merge(['api_key_model' => $apiKey]);

        if ($apiKey->user) {
            Auth::setUser($apiKey->user);
            $request->setUserResolver(fn () => $apiKey->user);
        }

        return $next($request);
    }
}
