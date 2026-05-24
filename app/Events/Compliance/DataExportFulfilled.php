<?php

namespace App\Events\Compliance;

use App\Models\Compliance\DataAccessRequest;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class DataExportFulfilled
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public DataAccessRequest $request,
        public string $downloadUrl,
    ) {}
}
