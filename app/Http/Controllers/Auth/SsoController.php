<?php

namespace App\Http\Controllers\Auth;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Http;
use App\Models\User;
use Illuminate\Support\Facades\Auth;
use Illuminate\Support\Str;

class SsoController extends Controller
{
    public function handle(Request $request)
    {
        $token = $request->query('token');

        if (!$token || $token === 'undefined') {
            return redirect('https://accounts.openrockets.com/login?redirect_uri=' . urlencode(route('sso.handle')))
                ->withErrors(['sso' => 'No authentication token provided.']);
        }

        // Fetch user details from openrocketsauth API using the token
        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json'])
            ->get('https://openrocketsauth.alwaysdata.net/api/auth/me');

        if ($response->failed()) {
            return redirect()->away('https://accounts.openrockets.com/login?error=invalid_token');
        }

        $userData = $response->json();

        // Check if user exists in the local myaccount database
        $user = User::where('email', $userData['email'])->first();

        if (!$user) {
            // Mirror the user into the local database
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'email_verified_at' => now(), // SSO users are inherently verified — they authenticated through the auth server
                'password' => bcrypt(Str::random(24)), // Random password, authentication is handled by the SSO token
            ]);
        } elseif (!$user->email_verified_at) {
            // Existing user who hasn't been verified yet — mark as verified since they came through SSO
            $user->email_verified_at = now();
            $user->save();
        }

        // Establish local session
        Auth::login($user);

        // Redirect to dashboard
        return redirect()->route('dashboard');
    }
}
