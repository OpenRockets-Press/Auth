<?php

namespace App\Http\Middleware;

use App\Services\AuditService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuditRequest
{
    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (config('auth-system.audit.enabled', true)) {
            $user = Auth::user();

            $this->auditService->log(
                'http.request',
                $user,
                null,
                [
                    'method' => $request->method(),
                    'url' => $request->fullUrl(),
                    'status' => $response->getStatusCode(),
                ],
                $request->ip(),
                $request->userAgent()
            );
        }

        return $response;
    }
}
