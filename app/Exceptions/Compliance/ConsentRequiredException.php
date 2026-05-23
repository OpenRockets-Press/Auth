<?php

namespace App\Exceptions\Compliance;

use App\Exceptions\BaseException;

class ConsentRequiredException extends BaseException
{
    public function __construct()
    {
        parent::__construct('Parental consent is required before proceeding.');
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
