<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class SessionController extends Controller
{
    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $tokens = $request->user()->tokens()
            ->orderBy('created_at', 'desc')
            ->get()
            ->map(fn ($token) => [
                'id' => $token->id,
                'name' => $token->name,
                'scopes' => $token->scopes,
                'last_used_at' => $token->last_used_at,
                'expires_at' => $token->expires_at,
                'created_at' => $token->created_at,
            ]);

        return response()->json(['sessions' => $tokens]);
    }

    public function destroy(Request $request, string $tokenId): JsonResponse
    {
        $token = $request->user()->tokens()->findOrFail($tokenId);
        $token->revoke();

        return response()->json(['message' => 'Session revoked.']);
    }

    public function destroyAll(Request $request): JsonResponse
    {
        $currentTokenId = $request->user()->currentAccessToken()->id;

        $request->user()->tokens()
            ->where('id', '!=', $currentTokenId)
            ->delete();

        return response()->json(['message' => 'All other sessions revoked.']);
    }
}
