<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use App\Models\User;

class AdminController extends Controller
{
    public function dashboard(Request $request)
    {
        $stats = [
            'total_users' => User::count(),
            'total_apps' => DB::table('apps')->count(),
            'active_consents' => DB::table('consent_records')->where('status', 'active')->count(),
            'pending_parental_consents' => DB::table('parental_consents')->where('status', 'pending')->count(),
        ];

        return Inertia::render('admin/dashboard', [
            'stats' => $stats,
        ]);
    }

    public function users(Request $request)
    {
        $query = User::query()->with('profile');

        if ($request->has('search')) {
            $search = $request->input('search');
            $query->where(function($q) use ($search) {
                $q->where('name', 'like', "%{$search}%")
                  ->orWhere('email', 'like', "%{$search}%");
            });
        }

        $users = $query->latest()->paginate(15)->withQueryString();

        return Inertia::render('admin/users/index', [
            'users' => $users,
            'filters' => $request->only(['search']),
        ]);
    }

    public function apps(Request $request)
    {
        $apps = DB::table('apps')
            ->join('users', 'apps.owner_id', '=', 'users.id')
            ->select('apps.*', 'users.name as owner_name', 'users.email as owner_email')
            ->orderBy('apps.created_at', 'desc')
            ->paginate(15);

        return Inertia::render('admin/apps/index', [
            'apps' => $apps,
        ]);
    }
}
