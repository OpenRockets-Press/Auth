<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WebhookDeliveryResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'event_type' => $this->event_type,
            'status' => $this->status,
            'attempts' => $this->attempts,
            'last_attempt_at' => $this->last_attempt_at,
            'response_code' => $this->response_code,
            'created_at' => $this->created_at,
        ];
    }
}
