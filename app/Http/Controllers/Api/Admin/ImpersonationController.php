<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\UserResource;
use App\Models\User;
use App\Services\AuditService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function store(Request $request, User $user): JsonResponse
    {
        $this->authorize('impersonate', $user);

        $admin = $request->user();
        $adminTokenId = $admin->currentAccessToken()->id;

        $impersonationToken = $user->createToken(
            'impersonation-by-admin-'.$admin->id.'-original-token-'.$adminTokenId
        );

        $this->auditService->log(
            'admin.impersonation.started',
            $admin,
            data: [
                'target_user_id' => $user->id,
                'target_user_name' => $user->name,
                'target_user_email' => $user->email,
                'original_token_id' => $adminTokenId,
            ],
        );

        return response()->json([
            'message' => 'Now impersonating '.$user->name,
            'user' => new UserResource($user),
            'impersonation_token' => $impersonationToken->accessToken,
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();
        $tokenName = $token->name;

        if (! str_starts_with($tokenName, 'impersonation-by-admin-')) {
            return response()->json(['message' => 'Current token is not an impersonation token.'], 400);
        }

        preg_match('/impersonation-by-admin-(\d+)-original-token-(\d+)/', $tokenName, $matches);
        $adminId = $matches[1] ?? null;
        $originalTokenId = $matches[2] ?? null;

        $token->delete();

        if ($adminId) {
            $admin = User::find($adminId);
            if ($admin) {
                $this->auditService->log(
                    'admin.impersonation.stopped',
                    $admin,
                    data: [
                        'impersonated_user_id' => $request->user()->id,
                        'original_token_id' => $originalTokenId,
                    ],
                );
            }
        }

        return response()->json([
            'message' => 'Stopped impersonation.',
        ]);
    }

    public function status(Request $request): JsonResponse
    {
        $token = $request->user()->currentAccessToken();
        $tokenName = $token->name;

        if (! str_starts_with($tokenName, 'impersonation-by-admin-')) {
            return response()->json(['is_impersonating' => false]);
        }

        preg_match('/impersonation-by-admin-(\d+)/', $tokenName, $matches);
        $adminId = $matches[1] ?? null;

        $admin = $adminId ? User::find($adminId) : null;

        return response()->json([
            'is_impersonating' => true,
            'admin_id' => $adminId,
            'admin_name' => $admin?->name,
            'admin_email' => $admin?->email,
        ]);
    }
}
