<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class ConsentController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();

        $consents = DB::table('consent_records')
            ->join('apps', 'consent_records.app_id', '=', 'apps.id')
            ->select('consent_records.id', 'consent_records.status', 'consent_records.created_at', 'apps.name as app_name', 'apps.logo_url', 'apps.privacy_policy_url', 'apps.terms_of_service_url')
            ->where('consent_records.user_id', $user->id)
            ->where('consent_records.status', 'active')
            ->get();

        return Inertia::render('consents/index', [
            'consents' => $consents,
        ]);
    }

    public function destroy(Request $request, $id)
    {
        $user = $request->user();

        // Verify the consent belongs to the user
        $consent = DB::table('consent_records')
            ->where('id', $id)
            ->where('user_id', $user->id)
            ->first();

        if (!$consent) {
            abort(404);
        }

        DB::table('consent_records')
            ->where('id', $id)
            ->update([
                'status' => 'revoked',
                'revoked_at' => now(),
            ]);

        return redirect()->back()->with('success', 'Access revoked successfully.');
    }
}
