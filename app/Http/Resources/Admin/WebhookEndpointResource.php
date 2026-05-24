<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class WebhookEndpointResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'app_id' => $this->app_id,
            'url' => $this->url,
            'events' => $this->events,
            'is_active' => $this->is_active,
            'last_delivery_at' => $this->when(
                $this->relationLoaded('deliveries') && $this->deliveries->isNotEmpty(),
                fn () => $this->deliveries->sortByDesc('created_at')->first()->created_at,
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
