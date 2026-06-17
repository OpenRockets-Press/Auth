<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;

class OnboardingController extends Controller
{
    public function index(Request $request)
    {
        $user = $request->user();
        
        if ($user->hasCompletedOnboarding()) {
            return redirect()->route('dashboard');
        }

        $countries = DB::table('countries')->select('code', 'name')->get();

        return Inertia::render('onboarding/index', [
            'countries' => $countries,
            'onboarding_status' => $user->profile?->onboarding_status ?? 'incomplete',
            'required_fields' => ['country_code', 'state', 'date_of_birth'],
        ]);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'country_code' => 'required|string|size:2',
            'state' => 'required|string|max:255',
            'city' => 'nullable|string|max:255',
            'date_of_birth' => 'required|date|before:today',
        ]);

        $user = $request->user();
        
        $profile = $user->profile()->firstOrCreate(['user_id' => $user->id]);
        
        $profile->update([
            'country_code' => $validated['country_code'],
            'state' => $validated['state'],
            'city' => $validated['city'] ?? null,
            'date_of_birth' => $validated['date_of_birth'],
            'onboarding_status' => 'completed',
            'onboarding_completed_at' => now(),
        ]);

        return redirect()->route('dashboard')->with('success', 'Profile completed successfully!');
    }

    public function parentalConsent(Request $request)
    {
        $user = $request->user();
        
        if ($user->hasCompletedOnboarding()) {
            return redirect()->route('dashboard');
        }

        return Inertia::render('onboarding/parental-consent', [
            'parental_consent_status' => $user->profile?->parental_consent_status ?? 'not_required',
            'parent_email' => $user->parentalConsents()->latest()->first()?->parent_email,
        ]);
    }
}
