<?php

namespace App\Listeners;

use App\Events\OAuth\AppRegistered;
use App\Models\Admin\Role;
use App\Models\User;
use App\Notifications\NewAppRegistration;
use Illuminate\Support\Facades\Notification;

class NotifyAdminsOfNewApp
{
    public function handle(AppRegistered $event): void
    {
        $adminRole = Role::where('name', 'super_admin')->first();

        if (! $adminRole) {
            return;
        }

        $admins = User::whereHas('roles', fn ($q) => $q->where('name', 'super_admin'))->get();

        if ($admins->isEmpty()) {
            return;
        }

        $reviewUrl = config('app.url').'/admin/apps/'.$event->app->id;

        Notification::send($admins, new NewAppRegistration(
            $event->app->name,
            $event->app->owner->name,
            $reviewUrl,
        ));
    }
}
