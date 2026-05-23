<?php

namespace App\Jobs;

use App\Models\Compliance\ParentalConsent;
use App\Notifications\ParentalConsentRequest;
use Illuminate\Contracts\Queue\ShouldQueue;
use Illuminate\Foundation\Queue\Queueable;
use Illuminate\Support\Facades\Mail;

class SendParentalConsentEmail implements ShouldQueue
{
    use Queueable;

    public function __construct(
        public ParentalConsent $consent,
    ) {}

    public function handle(): void
    {
        $user = $this->consent->user;

        Mail::to($this->consent->parent_email)->send(
            new ParentalConsentRequest($this->consent)
        );
    }
}
