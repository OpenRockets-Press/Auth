<?php

namespace App\Exceptions\OAuth;

use App\Exceptions\BaseException;

class InvalidRedirectUriException extends BaseException
{
    public function __construct()
    {
        parent::__construct('The redirect URI is not registered for this application.');
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
