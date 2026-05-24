<?php

namespace App\Http\Resources\Settings;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class TrustedDeviceResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'device_name' => $this->device_name,
            'trusted_at' => $this->trusted_at,
            'last_used_at' => $this->last_used_at,
            'is_current' => $this->device_fingerprint === $this->getCurrentFingerprint(),
        ];
    }

    protected function getCurrentFingerprint(): ?string
    {
        $request = request();

        if (! $request) {
            return null;
        }

        $userAgent = $request->userAgent() ?? '';
        $ip = $request->ip();

        return hash('sha256', $userAgent.$ip.config('app.key'));
    }
}
