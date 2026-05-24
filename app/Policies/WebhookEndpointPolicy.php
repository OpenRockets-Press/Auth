<?php

namespace App\Policies;

use App\Models\Admin\WebhookEndpoint;
use App\Models\User;

class WebhookEndpointPolicy
{
    public function view(User $user, WebhookEndpoint $endpoint): bool
    {
        if ($endpoint->app) {
            return $user->id === $endpoint->app->owner_id || $user->hasPermission('webhooks.view');
        }

        return $user->hasPermission('webhooks.view_all');
    }

    public function create(User $user): bool
    {
        return $user->hasPermission('webhooks.create') || $user->hasPermission('webhooks.manage');
    }

    public function update(User $user, WebhookEndpoint $endpoint): bool
    {
        return $this->view($user, $endpoint);
    }

    public function delete(User $user, WebhookEndpoint $endpoint): bool
    {
        return $this->view($user, $endpoint);
    }
}
