<?php

namespace App\Exceptions\Compliance;

use App\Exceptions\BaseException;

class InvalidConsentTokenException extends BaseException
{
    public function __construct()
    {
        parent::__construct('The parental consent verification token is invalid or expired.');
    }

    public function getStatusCode(): int
    {
        return 400;
    }

    public function getErrorMessage(): string
    {
        return $this->getMessage();
    }
}
