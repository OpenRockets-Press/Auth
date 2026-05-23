<?php

namespace App\Exceptions\Security;

use App\Exceptions\BaseException;

class RateLimitExceededException extends BaseException
{
    public function __construct(string $message = 'Too many requests.')
    {
        parent::__construct($message);
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
