<?php

namespace App\Http\Controllers\Settings;

use App\Http\Controllers\Controller;
use App\Http\Requests\Settings\PasswordUpdateRequest;
use App\Http\Requests\Settings\TwoFactorAuthenticationRequest;
use Illuminate\Http\RedirectResponse;
use Illuminate\Validation\Rules\Password;
use Inertia\Inertia;
use Inertia\Response;
use Laravel\Fortify\Features;

class SecurityController extends Controller
{
    /**
     * Show the user's security settings page.
     */
    public function edit(TwoFactorAuthenticationRequest $request): Response
    {
        $sessions = \Illuminate\Support\Facades\DB::table('sessions')
            ->where('user_id', $request->user()->getAuthIdentifier())
            ->orderBy('last_activity', 'desc')
            ->get()
            ->map(function ($session) use ($request) {
                $userAgent = $session->user_agent ?: '';
                
                // Simple OS detection
                $platform = 'Unknown';
                if (stripos($userAgent, 'windows') !== false) $platform = 'Windows';
                elseif (stripos($userAgent, 'mac') !== false) $platform = 'macOS';
                elseif (stripos($userAgent, 'linux') !== false) $platform = 'Linux';
                elseif (stripos($userAgent, 'android') !== false) $platform = 'Android';
                elseif (stripos($userAgent, 'iphone') !== false || stripos($userAgent, 'ipad') !== false) $platform = 'iOS';

                // Simple Browser detection
                $browser = 'Unknown';
                if (stripos($userAgent, 'edg') !== false) $browser = 'Edge';
                elseif (stripos($userAgent, 'chrome') !== false) $browser = 'Chrome';
                elseif (stripos($userAgent, 'safari') !== false && stripos($userAgent, 'chrome') === false) $browser = 'Safari';
                elseif (stripos($userAgent, 'firefox') !== false) $browser = 'Firefox';

                // Simple Desktop detection
                $isDesktop = in_array($platform, ['Windows', 'macOS', 'Linux']);

                return [
                    'id' => $session->id,
                    'ip_address' => $session->ip_address,
                    'is_current_device' => $session->id === $request->session()->getId(),
                    'last_active' => \Carbon\Carbon::createFromTimestamp($session->last_activity)->diffForHumans(),
                    'agent' => [
                        'is_desktop' => $isDesktop,
                        'platform' => $platform,
                        'browser' => $browser,
                    ],
                ];
            });

        $props = [
            'canManageTwoFactor' => Features::canManageTwoFactorAuthentication(),
            'canManagePasskeys' => Features::canManagePasskeys(),
            'passkeys' => [],
            'passwordRules' => Password::defaults()->toPasswordRulesString(),
            'sessions' => $sessions,
        ];

        if (Features::canManageTwoFactorAuthentication()) {
            $request->ensureStateIsValid();

            $props['twoFactorEnabled'] = $request->user()->hasEnabledTwoFactorAuthentication();
            $props['requiresConfirmation'] = Features::optionEnabled(Features::twoFactorAuthentication(), 'confirm');
        }

        return Inertia::render('settings/security', $props);
    }

    /**
     * Update the user's password.
     */
    public function update(PasswordUpdateRequest $request): RedirectResponse
    {
        $request->user()->update([
            'password' => $request->password,
        ]);

        Inertia::flash('toast', ['type' => 'success', 'message' => __('Password updated.')]);

        return back();
    }
}
