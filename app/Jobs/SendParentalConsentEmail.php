<?php

namespace App\Jobs;

use App\Models\Compliance\ParentalConsent;
use App\Notifications\ParentalConsentRequest;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Notification;

class SendParentalConsentEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public ParentalConsent $consent,
    ) {}

    public function handle(): void
    {
        Notification::route('mail', $this->consent->parent_email)
            ->notify(new ParentalConsentRequest($this->consent));
    }
}
