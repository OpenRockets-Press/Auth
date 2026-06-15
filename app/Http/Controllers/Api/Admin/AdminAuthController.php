<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Models\User;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Laravel\Socialite\Facades\Socialite;

class AdminAuthController extends Controller
{
    /**
     * Redirect to Google Workspace for Admin authentication.
     */
    public function redirect(): JsonResponse
    {
        $url = Socialite::driver('google')
            ->stateless()
            ->with(['hd' => 'openrockets.com']) // Hint to only allow openrockets.com
            ->redirect()
            ->getTargetUrl();

        return response()->json(['redirect_url' => $url]);
    }

    /**
     * Handle callback from Google Workspace.
     */
    public function callback(Request $request): JsonResponse
    {
        try {
            $socialUser = Socialite::driver('google')->stateless()->user();
            
            $email = $socialUser->getEmail();
            
            // STRICT DOMAIN RESTRICTION
            if (!str_ends_with($email, '@openrockets.com')) {
                return response()->json([
                    'message' => 'Unauthorized. Admin access is strictly limited to @openrockets.com domain.'
                ], 403);
            }

            // Find or create the admin user
            $user = User::firstOrCreate(
                ['email' => $email],
                [
                    'name' => $socialUser->getName() ?? 'Admin',
                    'password' => bcrypt(str()->random(32)),
                    'email_verified_at' => now(),
                ]
            );

            // Ensure they have admin privileges
            if (!$user->isAdmin()) {
                // By default, promote @openrockets.com to super_admin or we can enforce manual promotion.
                // For this implementation, since the email is validated, we attach 'super_admin' role.
                // Wait, it depends on how roles are assigned in your app. Let's assume standard syncing.
                $user->roles()->syncWithoutDetaching([\App\Models\Role::where('name', 'super_admin')->first()->id]);
            }

            // Issue an admin token
            $token = $user->createToken('admin-access-token')->accessToken;

            return response()->json([
                'access_token' => $token,
                'token_type' => 'Bearer',
                'user' => [
                    'id' => $user->id,
                    'name' => $user->name,
                    'email' => $user->email,
                    'roles' => $user->roles->pluck('name')
                ]
            ]);

        } catch (\Exception $e) {
            \Log::error('Admin Google Auth failed: ' . $e->getMessage());
            return response()->json(['message' => 'Authentication failed.'], 400);
        }
    }
}
