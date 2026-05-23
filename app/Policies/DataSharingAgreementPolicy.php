<?php

namespace App\Policies;

use App\Models\DataHub\DataSharingAgreement;
use App\Models\User;

class DataSharingAgreementPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, DataSharingAgreement $agreement): bool
    {
        return $user->id === $agreement->user_id;
    }

    public function create(User $user): bool
    {
        return $user->status === 'active';
    }

    public function revoke(User $user, DataSharingAgreement $agreement): bool
    {
        return $user->id === $agreement->user_id;
    }
}
