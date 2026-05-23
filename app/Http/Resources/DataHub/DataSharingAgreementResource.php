<?php

namespace App\Http\Resources\DataHub;

use App\Http\Resources\OAuth\AppResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DataSharingAgreementResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'source_app' => new AppResource($this->whenLoaded('sourceApp')),
            'target_app' => new AppResource($this->whenLoaded('targetApp')),
            'data_keys' => $this->data_keys,
            'consent_status' => $this->consent_status,
            'granted_at' => $this->granted_at,
            'revoked_at' => $this->revoked_at,
            'is_active' => $this->isGranted(),
        ];
    }
}
