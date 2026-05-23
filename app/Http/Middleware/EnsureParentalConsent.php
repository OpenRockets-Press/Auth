<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureParentalConsent
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();

        if ($user->profile && $user->profile->parental_consent_required) {
            if (! $user->profile->hasConsent()) {
                return response()->json([
                    'message' => 'Parental consent is required before proceeding.',
                    'consent_status' => $user->profile->parental_consent_status,
                ], 403);
            }
        }

        return $next($request);
    }
}
