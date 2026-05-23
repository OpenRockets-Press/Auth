<?php

namespace App\Listeners;

use App\Events\Security\UserLoggedIn;
use App\Services\AuditService;

class LogUserLogin
{
    public function __construct(
        protected AuditService $auditService,
    ) {}

    public function handle(UserLoggedIn $event): void
    {
        $this->auditService->logLogin(
            $event->user,
            $event->method,
            true,
            [
                'ip_address' => $event->ipAddress,
                'user_agent' => $event->userAgent,
            ]
        );
    }
}
