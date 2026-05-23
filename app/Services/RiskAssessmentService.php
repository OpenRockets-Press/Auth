<?php

namespace App\Services;

use App\Models\Admin\TrustedDevice;
use App\Models\User;

class RiskAssessmentService
{
    public function assessLoginRisk(User $user, string $ipAddress, string $userAgent): array
    {
        $riskFactors = [];
        $riskScore = 0;

        if ($this->isNewDevice($user, $ipAddress, $userAgent)) {
            $riskFactors[] = 'new_device';
            $riskScore += 20;
        }

        if ($this->isNewLocation($user, $ipAddress)) {
            $riskFactors[] = 'new_location';
            $riskScore += 30;
        }

        if ($this->hasFailedAttempts($user)) {
            $riskFactors[] = 'failed_attempts';
            $riskScore += 25;
        }

        if ($this->isImpossibleTravel($user, $ipAddress)) {
            $riskFactors[] = 'impossible_travel';
            $riskScore += 50;
        }

        $level = $this->getRiskLevel($riskScore);

        return [
            'score' => $riskScore,
            'level' => $level,
            'factors' => $riskFactors,
            'require_step_up' => $level === 'high' || $level === 'critical',
        ];
    }

    public function isNewDevice(User $user, string $ipAddress, string $userAgent): bool
    {
        $fingerprint = $this->generateDeviceFingerprint($ipAddress, $userAgent);

        return ! TrustedDevice::where('user_id', $user->id)
            ->where('device_fingerprint', $fingerprint)
            ->exists();
    }

    public function isNewLocation(User $user, string $ipAddress): bool
    {
        $knownIps = $user->trustedDevices()
            ->whereNotNull('ip_address')
            ->pluck('ip_address')
            ->toArray();

        return ! in_array($ipAddress, $knownIps);
    }

    public function hasFailedAttempts(User $user): bool
    {
        return $user->failed_login_attempts > 0;
    }

    public function isImpossibleTravel(User $user, string $ipAddress): bool
    {
        $lastLogin = $user->last_login_at;

        if (! $lastLogin) {
            return false;
        }

        $hoursSinceLogin = $lastLogin->diffInHours(now());

        if ($hoursSinceLogin < 2) {
            $lastDevice = $user->trustedDevices()
                ->latest('last_used_at')
                ->first();

            if ($lastDevice && $lastDevice->ip_address !== $ipAddress) {
                $lastLocation = $this->getIpLocation($lastDevice->ip_address);
                $currentLocation = $this->getIpLocation($ipAddress);

                if ($lastLocation && $currentLocation) {
                    $distance = $this->calculateDistance(
                        $lastLocation['lat'],
                        $lastLocation['lon'],
                        $currentLocation['lat'],
                        $currentLocation['lon']
                    );

                    $speed = $distance / max($hoursSinceLogin, 0.1);

                    return $speed > 900;
                }
            }
        }

        return false;
    }

    public function trustDevice(User $user, string $deviceName, string $ipAddress, string $userAgent): TrustedDevice
    {
        $fingerprint = $this->generateDeviceFingerprint($ipAddress, $userAgent);

        return TrustedDevice::create([
            'user_id' => $user->id,
            'device_fingerprint' => $fingerprint,
            'device_name' => $deviceName,
            'ip_address' => $ipAddress,
            'user_agent' => $userAgent,
            'trusted_at' => now(),
            'last_used_at' => now(),
        ]);
    }

    public function isTrustedDevice(User $user, string $ipAddress, string $userAgent): bool
    {
        $fingerprint = $this->generateDeviceFingerprint($ipAddress, $userAgent);

        return TrustedDevice::where('user_id', $user->id)
            ->where('device_fingerprint', $fingerprint)
            ->exists();
    }

    public function generateDeviceFingerprint(string $ipAddress, string $userAgent): string
    {
        return hash('sha256', $ipAddress.'|'.$userAgent.'|'.config('app.key'));
    }

    protected function getRiskLevel(int $score): string
    {
        return match (true) {
            $score >= 75 => 'critical',
            $score >= 50 => 'high',
            $score >= 25 => 'medium',
            default => 'low',
        };
    }

    protected function getIpLocation(string $ipAddress): ?array
    {
        $cacheKey = 'ip_location_'.md5($ipAddress);

        return cache()->remember($cacheKey, now()->addDays(30), function () use ($ipAddress) {
            $service = config('auth-system.ip_geolocation.service', 'ip-api');

            return match ($service) {
                'maxmind' => $this->getIpLocationViaMaxMind($ipAddress),
                'ip-api' => $this->getIpLocationViaIpApi($ipAddress),
                default => null,
            };
        });
    }

    protected function getIpLocationViaMaxMind(string $ipAddress): ?array
    {
        if (! extension_loaded('geoip2') || ! class_exists('\GeoIp2\Database\Reader')) {
            return null;
        }

        try {
            $reader = new \GeoIp2\Database\Reader(
                config('auth-system.ip_geolocation.maxmind_database_path')
            );
            $record = $reader->city($ipAddress);

            return [
                'lat' => $record->location->latitude,
                'lon' => $record->location->longitude,
                'country' => $record->country->isoCode,
                'city' => $record->city->name,
            ];
        } catch (\Exception) {
            return null;
        }
    }

    protected function getIpLocationViaIpApi(string $ipAddress): ?array
    {
        try {
            $response = \Illuminate\Support\Facades\Http::timeout(5)
                ->get("http://ip-api.com/json/{$ipAddress}");

            if (! $response->ok()) {
                return null;
            }

            $data = $response->json();

            if ($data['status'] !== 'success') {
                return null;
            }

            return [
                'lat' => (float) $data['lat'],
                'lon' => (float) $data['lon'],
                'country' => $data['countryCode'],
                'city' => $data['city'],
            ];
        } catch (\Exception) {
            return null;
        }
    }

    protected function calculateDistance(float $lat1, float $lon1, float $lat2, float $lon2): float
    {
        $earthRadius = 6371;

        $dLat = deg2rad($lat2 - $lat1);
        $dLon = deg2rad($lon2 - $lon1);

        $a = sin($dLat / 2) * sin($dLat / 2) +
            cos(deg2rad($lat1)) * cos(deg2rad($lat2)) *
            sin($dLon / 2) * sin($dLon / 2);

        $c = 2 * atan2(sqrt($a), sqrt(1 - $a));

        return $earthRadius * $c;
    }
}
