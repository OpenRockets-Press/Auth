<?php

namespace App\Http\Resources\OAuth;

use App\Http\Resources\Admin\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class AppResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'description' => $this->description,
            'icon_url' => $this->icon_url,
            'status' => $this->status,
            'is_system' => $this->is_system,
            'redirect_uris' => $this->redirect_uris,
            'homepage_url' => $this->homepage_url,
            'privacy_policy_url' => $this->privacy_policy_url,
            'terms_url' => $this->terms_url,
            'category' => $this->category,
            'verified_at' => $this->verified_at,
            'owner' => new UserResource($this->whenLoaded('owner')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
