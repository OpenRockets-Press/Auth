<?php

namespace App\Http\Resources\Admin;

use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class UserResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'name' => $this->name,
            'email' => $this->email,
            'email_verified_at' => $this->email_verified_at,
            'status' => $this->status,
            'last_login_at' => $this->last_login_at,
            'roles' => $this->when(
                $this->relationLoaded('roles'),
                fn () => $this->roles->map(fn ($role) => [
                    'id' => $role->id,
                    'name' => $role->name,
                ]),
            ),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
