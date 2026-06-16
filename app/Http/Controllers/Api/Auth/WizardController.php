<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Storage;
use App\Models\User;
use App\Models\UserProfile;
use App\Models\ParentalConsent;
use Illuminate\Http\JsonResponse;

class WizardController extends Controller
{
    public function registerMinorWizard(Request $request): JsonResponse
    {
        $request->validate([
            'name' => 'required|string|max:255',
            'email' => 'required|string|email|max:255|unique:users',
            'password' => 'required|string|min:8',
            'parent_email' => 'required|string|email|max:255',
            'parent_name' => 'required|string|max:255',
            'dob' => 'required|date',
            'pin' => 'required|string|size:4',
            'profile_image' => 'nullable|image|max:5120', // Max 5MB
            'signature' => 'required|string', // base64
        ]);

        $email = $request->email;
        $parentEmail = $request->parent_email;

        $minorVerified = Cache::get("otp_verified_minor_{$email}");
        $parentVerified = Cache::get("otp_verified_parent_{$parentEmail}");

        // Security check: Ensure both the minor and parent have verified their emails via OTP
        if (!$minorVerified || !$parentVerified) {
            return response()->json(['message' => 'Both minor and parent email verification is strictly required.'], 403);
        }

        try {
            DB::beginTransaction();

            // Create User
            $user = User::create([
                'name' => $request->name,
                'email' => $request->email,
                'password' => Hash::make($request->password),
                'email_verified_at' => now(), // since OTP was verified
            ]);

            // Handle Profile Image Upload to local storage
            $avatarUrl = null;
            if ($request->hasFile('profile_image')) {
                // Store in local storage 'public' disk
                $path = $request->file('profile_image')->store('avatars', 'public');
                $avatarUrl = Storage::url($path);
            }

            // Create UserProfile
            $user->profile()->create([
                'date_of_birth' => $request->dob,
                'avatar_url' => $avatarUrl,
                'pin' => Hash::make($request->pin),
                'status' => 'pending_parental_consent', // default or active based on logic
            ]);

            // Create Parental Consent
            $user->parentalConsent()->create([
                'parent_email' => $request->parent_email,
                'parent_name' => $request->parent_name,
                'signature' => $request->signature, // Store base64 or you can decode and store as file
                'status' => 'approved', // Assuming approved since signature provided
                'consent_method' => 'digital_signature',
                'granted_at' => now(),
            ]);

            // Assign standard role or minor role
            // $user->roles()->attach(Role::where('name', 'User')->first());

            // Clear the verified OTP caches
            Cache::forget("otp_verified_minor_{$email}");
            Cache::forget("otp_verified_parent_{$parentEmail}");

            DB::commit();

            // Create a token
            $token = $user->createToken('auth_token')->accessToken;

            return response()->json([
                'user' => $user->load('profile', 'parentalConsent'),
                'token' => $token
            ], 201);

        } catch (\Exception $e) {
            DB::rollBack();
            return response()->json([
                'message' => 'Registration failed.',
                'error' => $e->getMessage()
            ], 500);
        }
    }
}
