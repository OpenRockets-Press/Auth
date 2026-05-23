<?php

namespace App\Listeners;

use App\Events\Compliance\ParentalConsentRequested;
use App\Jobs\SendParentalConsentEmail;
use Illuminate\Support\Facades\Queue;

class SendParentalConsentNotification
{
    public function handle(ParentalConsentRequested $event): void
    {
        Queue::push(new SendParentalConsentEmail($event->consent));
    }
}
