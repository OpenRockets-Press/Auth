<?php

namespace App\Http\Middleware;

use Closure;
use Illuminate\Http\Request;
use Symfony\Component\HttpFoundation\Response;

class EnsureAppIsActive
{
    public const ROUTE_PARAMETERS = ['app', 'app_id', 'application'];

    public function handle(Request $request, Closure $next): Response
    {
        $app = null;

        foreach (self::ROUTE_PARAMETERS as $param) {
            $app = $request->route($param);
            if ($app !== null) {
                break;
            }
        }

        if ($app && is_object($app) && method_exists($app, 'isSuspended')) {
            if ($app->isSuspended()) {
                return response()->json(['message' => 'Application has been suspended.'], 403);
            }

            if ($app->status === 'rejected') {
                return response()->json(['message' => 'Application has been rejected.'], 403);
            }
        }

        return $next($request);
    }
}
