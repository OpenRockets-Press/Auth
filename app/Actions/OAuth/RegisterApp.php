<?php

namespace App\Actions\OAuth;

use App\Models\OAuth\App;
use App\Models\User;
use App\Services\OAuthService;

class RegisterApp
{
    public function __construct(
        protected OAuthService $oauthService,
    ) {}

    public function handle(User $owner, array $data): App
    {
        return $this->oauthService->registerApp($owner, $data);
    }
}
