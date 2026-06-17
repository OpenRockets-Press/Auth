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

        // Get basic stats for the user
        $activeConsents = DB::table('consent_records')
            ->where('user_id', $user->id)
            ->where('status', 'active')
            ->count();

        $connectedAccounts = DB::table('social_accounts')
            ->where('user_id', $user->id)
            ->count();
            
        $activeSessions = DB::table('sessions')
            ->where('user_id', $user->id)
            ->count();

        return Inertia::render('dashboard', [
            'stats' => [
                'active_consents' => $activeConsents,
                'connected_accounts' => $connectedAccounts,
                'active_sessions' => $activeSessions,
                'security_status' => $user->hasEnabledTwoFactorAuthentication() ? 'Strong' : 'Needs Attention',
            ]
        ]);
    }
}
