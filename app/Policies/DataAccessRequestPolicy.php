<?php

namespace App\Policies;

use App\Models\Compliance\DataAccessRequest;
use App\Models\DataHub\DataRequest;
use App\Models\User;

class DataAccessRequestPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('data_requests.view');
    }

    public function view(User $user, DataAccessRequest $request): bool
    {
        return $user->id === $request->user_id || $user->hasPermission('data_requests.view');
    }

    public function fulfill(User $user, DataAccessRequest $request): bool
    {
        return $user->hasPermission('data_requests.manage');
    }

    public function grantConsent(User $user, DataRequest $request): bool
    {
        return $user->id === $request->user_id;
    }
}
