<?php

namespace App\Notifications;

use Illuminate\Bus\Queueable;
use Illuminate\Notifications\Messages\MailMessage;
use Illuminate\Notifications\Notification;

class DataDeletionConfirmation extends Notification
{
    use Queueable;

    public function via(object $notifiable): array
    {
        return ['mail'];
    }

    public function toMail(object $notifiable): MailMessage
    {
        return (new MailMessage)
            ->subject('Your Data Has Been Deleted')
            ->line('Your data deletion request has been completed.')
            ->line('All personal data associated with your account has been permanently removed from our systems.')
            ->line('This action cannot be undone.');
    }
}
