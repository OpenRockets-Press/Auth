<?php

namespace App\Http\Resources\OAuth;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class ConsentRecordResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'app' => new AppResource($this->whenLoaded('app')),
            'scopes' => $this->scopes,
            'consent_method' => $this->consent_method,
            'granted_at' => $this->granted_at,
            'revoked_at' => $this->revoked_at,
            'is_active' => $this->isActive(),
        ];
    }
}
