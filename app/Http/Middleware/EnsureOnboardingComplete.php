<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureOnboardingComplete
{
    protected array $allowedPaths = [
        'api/auth',
        'api/onboarding',
        'api/compliance/countries',
        'api/compliance/country',
        'api/settings',
        'api/consent/verify',
        '.well-known',
    ];

    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();

        if (! $user->profile) {
            return $next($request);
        }

        if ($user->hasCompletedOnboarding()) {
            return $next($request);
        }

        $path = $request->path();

        foreach ($this->allowedPaths as $allowed) {
            if (str_starts_with($path, $allowed)) {
                return $next($request);
            }
        }

        return response()->json([
            'message' => 'Please complete your profile setup before proceeding.',
            'onboarding_status' => 'incomplete',
            'required_fields' => ['country_code', 'state', 'date_of_birth'],
            'onboarding_endpoint' => '/api/onboarding',
        ], 403);
    }
}
