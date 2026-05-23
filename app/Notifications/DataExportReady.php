<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DataExportReady extends Notification
{
    use Queueable;

    public function __construct(
        public string $downloadUrl,
    ) {}

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Data Export is Ready')
            ->line('Your data export has been compiled and is ready for download.')
            ->action('Download Data', $this->downloadUrl)
            ->line('This link will expire in 7 days.')
            ->line('If you did not request this export, please contact support immediately.');
    }
}
