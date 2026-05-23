<?php

namespace App\Exceptions\Security;

use App\Exceptions\BaseException;

class AccountLockedException extends BaseException
{
    public function __construct()
    {
        parent::__construct('Account is temporarily locked due to too many failed login attempts.');
    }

    public function getStatusCode(): int
    {
        return 429;
    }

    public function getErrorMessage(): string
    {
        return $this->getMessage();
    }
}
