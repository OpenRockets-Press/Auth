<?php

namespace App\Exceptions\DataHub;

use App\Exceptions\BaseException;

class NoDataSharingAgreementException extends BaseException
{
    public function __construct(string $message = 'No active data sharing agreement exists.')
    {
        parent::__construct($message);
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
