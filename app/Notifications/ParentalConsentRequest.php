<?php

namespace App\Notifications;

use App\Models\Compliance\ParentalConsent;
use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class ParentalConsentRequest extends Notification
{
    use Queueable;

    public function __construct(
        public ParentalConsent $consent,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        $url = config('app.url').'/consent/verify/'.$this->consent->verification_token;

        return (new MailMessage)
            ->subject('Parental Consent Request for '.$this->consent->user->name)
            ->line('Your child '.$this->consent->user->name.' has requested to use our service.')
            ->line('As they are under the age of digital consent in their country, your permission is required.')
            ->action('Grant Consent', $url.'?action=grant')
            ->action('Deny Consent', $url.'?action=deny')
            ->line('This link will expire in '.config('auth-system.parental_consent.token_lifetime_hours', 48).' hours.');
    }
}
