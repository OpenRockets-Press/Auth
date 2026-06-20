<?php

namespace App\Http\Controllers\Api\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Cache;
use Illuminate\Support\Facades\Mail;
use App\Mail\OtpMail;
use Illuminate\Http\JsonResponse;

class OtpController extends Controller
{
    public function send(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'type' => 'required|in:parent,minor',
            'name' => 'nullable|string|max:255',
        ]);

        $email = $request->email;
        $type = $request->type;
        $name = $request->name;

        // Generate a 6-digit OTP
        $otp = sprintf('%06d', mt_rand(100000, 999999));

        // Store OTP in cache for 15 minutes
        $cacheKey = "otp_{$type}_{$email}";
        Cache::put($cacheKey, $otp, now()->addMinutes(15));

        // Send OTP email
        try {
            Mail::to($email)->send(new OtpMail($otp, $type, $name));
        } catch (\Exception $e) {
            return response()->json([
                'message' => 'Email failed to send: ' . $e->getMessage()
            ], 500);
        }

        return response()->json([
            'message' => 'OTP sent successfully.'
        ], 200);
    }

    public function verify(Request $request): JsonResponse
    {
        $request->validate([
            'email' => 'required|email',
            'otp' => 'required|string|size:6',
            'type' => 'required|in:parent,minor',
        ]);

        $email = $request->email;
        $otp = $request->otp;
        $type = $request->type;

        $cacheKey = "otp_{$type}_{$email}";
        $cachedOtp = Cache::get($cacheKey);

        if (!$cachedOtp || $cachedOtp !== $otp) {
            return response()->json([
                'message' => 'Invalid or expired OTP.'
            ], 400);
        }

        // Drop the used OTP
        Cache::forget($cacheKey);

        // Set a "verified" flag in cache valid for 30 minutes
        Cache::put("otp_verified_{$type}_{$email}", true, now()->addMinutes(30));

        return response()->json([
            'message' => 'OTP verified successfully.'
        ], 200);
    }
}
