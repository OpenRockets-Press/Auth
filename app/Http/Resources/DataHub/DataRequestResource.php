<?php

namespace App\Http\Resources\DataHub;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DataRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'requesting_app_id' => $this->requesting_app_id,
            'target_app_id' => $this->target_app_id,
            'data_keys' => $this->data_keys,
            'status' => $this->status,
            'user_consent_status' => $this->user_consent_status,
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
