<?php

namespace App\Events\OAuth;

use App\Models\OAuth\App;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class AppRegistered
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public App $app,
    ) {}
}
