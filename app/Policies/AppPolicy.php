<?php

namespace App\Policies;

use App\Models\OAuth\App;
use App\Models\User;

class AppPolicy
{
    public function viewAny(User $user): bool
    {
        return true;
    }

    public function view(User $user, App $app): bool
    {
        return $user->id === $app->owner_id || $user->isAdmin();
    }

    public function create(User $user): bool
    {
        return $user->status === 'active';
    }

    public function update(User $user, App $app): bool
    {
        return $user->id === $app->owner_id;
    }

    public function delete(User $user, App $app): bool
    {
        return $user->id === $app->owner_id || $user->isAdmin();
    }

    public function verify(User $user, App $app): bool
    {
        return $user->hasPermission('apps.verify');
    }

    public function reject(User $user, App $app): bool
    {
        return $user->hasPermission('apps.reject');
    }

    public function suspend(User $user, App $app): bool
    {
        return $user->hasPermission('apps.suspend');
    }

    public function manageWebhooks(User $user, App $app): bool
    {
        return $user->id === $app->owner_id || $user->hasPermission('webhooks.manage');
    }

    public function viewWebhook(User $user, App $app): bool
    {
        return $user->id === $app->owner_id || $user->hasPermission('webhooks.view');
    }
}
