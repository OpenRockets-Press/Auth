<?php

namespace App\Listeners;

use App\Events\Compliance\DataDeletionFulfilled;
use App\Notifications\DataDeletionConfirmation;

class SendDataDeletionNotification
{
    public function handle(DataDeletionFulfilled $event): void
    {
        $user = $event->request->user;

        if ($user) {
            $user->notify(new DataDeletionConfirmation);
        }
    }
}
