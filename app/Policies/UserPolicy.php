<?php

namespace App\Policies;

use App\Models\User;

class UserPolicy
{
    public function viewAny(User $user): bool
    {
        return $user->hasPermission('users.view');
    }

    public function view(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasPermission('users.view');
    }

    public function update(User $user, User $model): bool
    {
        return $user->id === $model->id || $user->hasPermission('users.manage');
    }

    public function suspend(User $user, User $model): bool
    {
        return $user->hasPermission('users.suspend') && $user->id !== $model->id;
    }

    public function delete(User $user, User $model): bool
    {
        return $user->hasPermission('users.delete') && $user->id !== $model->id;
    }

    public function impersonate(User $user, User $model): bool
    {
        return $user->hasPermission('users.impersonate') && $user->id !== $model->id;
    }
}
