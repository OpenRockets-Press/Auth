<?php

namespace App\Policies;

use App\Models\OAuth\ConsentRecord;
use App\Models\User;

class ConsentRecordPolicy
{
    public function view(User $user, ConsentRecord $record): bool
    {
        return $user->id === $record->user_id;
    }

    public function revoke(User $user, ConsentRecord $record): bool
    {
        return $user->id === $record->user_id;
    }
}
