<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\UserResource;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class ImpersonationController extends Controller
{
    public function store(Request $request, User $user): JsonResponse
    {
        $this->authorize('impersonate', $user);

        $adminToken = $request->user()->createToken('impersonation-original-user');

        $impersonationToken = $user->createToken('impersonation-token');

        return response()->json([
            'message' => 'Now impersonating '.$user->name,
            'user' => new UserResource($user),
            'impersonation_token' => $impersonationToken->accessToken,
            'restore_token' => $adminToken->accessToken,
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $request->user()->currentAccessToken()->delete();

        return response()->json([
            'message' => 'Stopped impersonation.',
        ]);
    }
}
