<?php

namespace App\Exceptions\OAuth;

use App\Exceptions\BaseException;

class AppSuspendedException extends BaseException
{
    public function __construct()
    {
        parent::__construct('Application has been suspended.');
    }

    public function getStatusCode(): int
    {
        return 403;
    }

    public function getErrorMessage(): string
    {
        return $this->getMessage();
    }
}
