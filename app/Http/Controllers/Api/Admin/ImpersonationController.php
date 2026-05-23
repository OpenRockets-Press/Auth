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

        $session = Auth::guard('web');
        $originalUserId = $session->user()?->id;

        $session->loginUsingId($user->id);

        session(['impersonator_id' => $originalUserId]);

        return response()->json([
            'message' => 'Now impersonating '.$user->name,
            'user' => new UserResource($user),
        ]);
    }

    public function destroy(Request $request): JsonResponse
    {
        $impersonatorId = session('impersonator_id');

        if (! $impersonatorId) {
            return response()->json(['message' => 'Not impersonating any user.'], 400);
        }

        session()->forget('impersonator_id');

        $impersonator = User::findOrFail($impersonatorId);
        Auth::guard('web')->login($impersonator);

        return response()->json([
            'message' => 'Stopped impersonation.',
            'user' => new UserResource($impersonator),
        ]);
    }
}
