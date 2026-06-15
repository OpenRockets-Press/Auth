<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class EnsureAdmin
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return response()->json(['message' => 'Unauthenticated.'], 401);
        }

        $user = Auth::user();
        if (! $user->isAdmin()) {
            return response()->json(['message' => 'Admin access required.'], 403);
        }

        // Secondary strict domain check to prevent any non-employee from accessing
        if (!str_ends_with($user->email, '@openrockets.com')) {
            return response()->json(['message' => 'Admin access restricted to @openrockets.com domain.'], 403);
        }

        return $next($request);
    }
}
