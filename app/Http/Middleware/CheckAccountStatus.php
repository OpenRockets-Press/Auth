<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class CheckAccountStatus
{
    public function handle(Request $request, Closure $next): Response
    {
        if (! Auth::check()) {
            return $next($request);
        }

        $user = Auth::user();

        if ($user->status === 'suspended') {
            return response()->json(['message' => 'Account has been suspended.'], 403);
        }

        if ($user->isLocked()) {
            $remaining = $user->locked_until->diffInSeconds(now());

            return response()->json([
                'message' => 'Account is temporarily locked.',
                'retry_after' => max($remaining, 0),
            ], 429);
        }

        return $next($request);
    }
}
