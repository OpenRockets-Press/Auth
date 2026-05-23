<?php

namespace App\Actions\OAuth;

use App\Models\OAuth\App;
use App\Models\OAuth\ConsentRecord;
use App\Services\OAuthService;

class ManageConsent
{
    public function __construct(
        protected OAuthService $oauthService,
    ) {}

    public function grant($user, $app, array $scopes, string $method = 'oauth_screen'): ConsentRecord
    {
        return $this->oauthService->grantConsent($user, $app, $scopes, $method);
    }

    public function revoke(ConsentRecord $record): void
    {
        $this->oauthService->revokeConsent($record);
    }

    public function revokeAll($user, App $app): void
    {
        $this->oauthService->revokeAllConsents($user, $app);
    }
}
