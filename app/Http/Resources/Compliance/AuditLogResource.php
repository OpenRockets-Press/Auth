<?php

namespace App\Http\Resources\Compliance;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AuditLogResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_type' => $this->event_type,
            'event_data' => $this->sanitizeEventData($this->event_data),
            'ip_address' => $this->maskIpAddress($this->ip_address),
            'user' => new UserResource($this->whenLoaded('user')),
            'app' => new \App\Http\Resources\OAuth\AppResource($this->whenLoaded('app')),
            'created_at' => $this->created_at,
        ];
    }

    protected function sanitizeEventData(?array $data): array
    {
        if (! $data) {
            return [];
        }

        $sensitiveKeys = ['password', 'token', 'secret', 'access_token', 'refresh_token', 'key_hash'];

        return collect($data)->mapWithKeys(function ($value, $key) use ($sensitiveKeys) {
            if (in_array(strtolower($key), $sensitiveKeys, true)) {
                return [$key => '[redacted]'];
            }

            return [$key => $value];
        })->toArray();
    }

    protected function maskIpAddress(?string $ip): ?string
    {
        if (! $ip) {
            return null;
        }

        $parts = explode('.', $ip);

        if (count($parts) === 4) {
            $parts[2] = 'xxx';
            $parts[3] = 'xxx';

            return implode('.', $parts);
        }

        return '[masked]';
    }
}
