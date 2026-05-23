<?php

namespace App\Listeners;

use App\Events\Security\UserLoggedOut;
use App\Services\AuditService;

class LogUserLogout
{
    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function handle(UserLoggedOut $event): void
    {
        $this->auditService->logLogout($event->user);
    }
}
