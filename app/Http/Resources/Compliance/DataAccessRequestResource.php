<?php

namespace App\Http\Resources\Compliance;

use App\Http\Resources\Admin\UserResource;
use Illuminate\Http\Request;
use Illuminate\Http\Resources\Json\JsonResource;

class DataAccessRequestResource extends JsonResource
{
    public function toArray(Request $request): array
    {
        return [
            'id' => $this->id,
            'request_type' => $this->request_type,
            'status' => $this->status,
            'requested_by' => $this->requested_by,
            'fulfilled_at' => $this->fulfilled_at,
            'data_export_path' => $this->when(
                $this->data_export_path !== null,
                $this->data_export_path,
            ),
            'user' => new UserResource($this->whenLoaded('user')),
            'created_at' => $this->created_at,
            'updated_at' => $this->updated_at,
        ];
    }
}
