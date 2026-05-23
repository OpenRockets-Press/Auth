<?php

namespace App\Events\Compliance;

use App\Models\Compliance\ParentalConsent;
use App\Models\User;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Foundation\Events\Dispatchable;
use Illuminate\Queue\SerializesModels;

class ParentalConsentRequested
{
    use Dispatchable, InteractsWithSockets, SerializesModels;

    public function __construct(
        public User $user,
        public ParentalConsent $consent,
    ) {}
}
