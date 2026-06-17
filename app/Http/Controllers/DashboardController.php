<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class DashboardController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        // Get basic stats for the user — wrapped in try/catch since myaccount DB may not have all tables
        try {
            $activeConsents = DB::table('consent_records')
                ->where('user_id', $user->id)
                ->whereNull('revoked_at')
                ->count();
        } catch (\Exception $e) {
            $activeConsents = 0;
        }

        try {
            $connectedAccounts = DB::table('social_accounts')
                ->where('user_id', $user->id)
                ->count();
        } catch (\Exception $e) {
            $connectedAccounts = 0;
        }

        try {
            $activeSessions = DB::table('sessions')
                ->where('user_id', $user->id)
                ->count();
        } catch (\Exception $e) {
            $activeSessions = 0;
        }

        $hasTwoFactor = method_exists($user, 'hasEnabledTwoFactorAuthentication') 
            ? $user->hasEnabledTwoFactorAuthentication() 
            : false;

        return Inertia::render('dashboard', [
            'stats' => [
                'active_consents' => $activeConsents,
                'connected_accounts' => $connectedAccounts,
                'active_sessions' => $activeSessions,
                'security_status' => $hasTwoFactor ? 'Strong' : 'Needs Attention',
            ]
        ]);
    }
}
