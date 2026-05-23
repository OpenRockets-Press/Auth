<?php

namespace App\Http\Middleware;

use App\Services\AuditService;
use Closure;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use Symfony\Component\HttpFoundation\Response;

class AuditRequest
{
    protected array $skipMethods = ['OPTIONS', 'HEAD'];

    protected array $skipPaths = [
        '/up',
        '/health',
        '/ping',
        '/favicon.ico',
        '/robots.txt',
    ];

    protected array $auditMethods = ['POST', 'PUT', 'PATCH', 'DELETE'];

    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function handle(Request $request, Closure $next): Response
    {
        $response = $next($request);

        if (config('auth-system.audit.enabled', true)) {
            if (! in_array($request->method(), $this->skipMethods, true)) {
                $path = parse_url($request->path(), PHP_URL_PATH);

                if (! $this->shouldSkipPath($path) && $this->shouldAudit($request, $response)) {
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
            }
        }

        return $response;
    }

    protected function shouldAudit(Request $request, Response $response): bool
    {
        if (in_array($request->method(), $this->auditMethods, true)) {
            return true;
        }

        if ($response->getStatusCode() >= 400) {
            return true;
        }

        $sampleRate = config('auth-system.audit.get_sample_rate', 0.01);

        if ($sampleRate <= 0) {
            return false;
        }

        if ($sampleRate >= 1) {
            return true;
        }

        return rand(1, 100) <= ($sampleRate * 100);
    }

    protected function shouldSkipPath(string $path): bool
    {
        foreach ($this->skipPaths as $skipPath) {
            if (str_starts_with($path, ltrim($skipPath, '/'))) {
                return true;
            }
        }

        return false;
    }
}
