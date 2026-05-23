<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class NewAppRegistration extends Notification
{
    use Queueable;

    public function __construct(
        public string $appName,
        public string $developerName,
        public string $reviewUrl,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('New App Registration: '.$this->appName)
            ->line('A new app has been registered and requires review.')
            ->line('App: '.$this->appName)
            ->line('Developer: '.$this->developerName)
            ->action('Review App', $this->reviewUrl);
    }
}
