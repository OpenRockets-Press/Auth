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

        if (!$token) {
            return redirect('https://accounts.openrockets.com/login')->withErrors(['sso' => 'No authentication token provided.']);
        }

        // Fetch user details from openrocketsauth API using the token
        $response = Http::withToken($token)
            ->withHeaders(['Accept' => 'application/json'])
            ->get('https://openrocketsauth.alwaysdata.net/api/auth/me');

        if ($response->failed() || !isset($response['id'])) {
            // Token is invalid or expired
            return redirect('https://accounts.openrockets.com/login')->withErrors(['sso' => 'Invalid or expired authentication session.']);
        }

        $userData = $response->json();

        // Check if user exists in the local myaccount database
        $user = User::where('email', $userData['email'])->first();

        if (!$user) {
            // Mirror the user into the local database
            $user = User::create([
                'name' => $userData['name'],
                'email' => $userData['email'],
                'password' => bcrypt(Str::random(24)), // Random password, authentication is handled by the SSO token
            ]);
            
            // Mark email as verified if it is in the auth database
            if (isset($userData['email_verified_at'])) {
                $user->email_verified_at = $userData['email_verified_at'];
                $user->save();
            }
        }

        // Establish local session
        Auth::login($user);

        // Redirect to dashboard
        return redirect()->route('dashboard');
    }
}
