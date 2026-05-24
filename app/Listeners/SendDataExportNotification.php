<?php

namespace App\Listeners;

use App\Events\Compliance\DataExportFulfilled;
use App\Notifications\DataExportReady;

class SendDataExportNotification
{
    public function handle(DataExportFulfilled $event): void
    {
        $event->request->user->notify(
            new DataExportReady($event->downloadUrl),
        );
    }
}
