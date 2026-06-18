<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use Inertia\Inertia;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Str;

class DeveloperAppController extends Controller
{
    public function index(Request $request)
    {
        $apps = DB::table('apps')
            ->where('owner_id', $request->user()->id)
            ->orderBy('created_at', 'desc')
            ->get();

        return Inertia::render('developer/apps/index', [
            'apps' => $apps,
        ]);
    }

    public function create()
    {
        return Inertia::render('developer/apps/create');
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'name' => 'required|string|max:255',
            'description' => 'nullable|string|max:1000',
            'homepage_url' => 'required|url|max:255',
            'privacy_policy_url' => 'required|url|max:255',
            'redirect_uris' => 'required|string', // Comma separated for now
        ]);

        $redirectUris = array_map('trim', explode(',', $validated['redirect_uris']));
        $redirectUrisJson = json_encode($redirectUris);

        DB::beginTransaction();
        try {
            // Create the Laravel Passport OAuth Client
            $clientId = (string) Str::uuid();
            $clientSecret = Str::random(40);

            DB::table('oauth_clients')->insert([
                'id' => $clientId,
                'owner_id' => $request->user()->id,
                'owner_type' => get_class($request->user()),
                'name' => $validated['name'],
                'secret' => $clientSecret,
                'redirect_uris' => implode(',', $redirectUris),
                'grant_types' => 'authorization_code,refresh_token',
                'revoked' => false,
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            // Create the Developer App record
            $appId = DB::table('apps')->insertGetId([
                'owner_id' => $request->user()->id,
                'client_id' => $clientId,
                'name' => $validated['name'],
                'description' => $validated['description'],
                'homepage_url' => $validated['homepage_url'],
                'privacy_policy_url' => $validated['privacy_policy_url'],
                'redirect_uris' => $redirectUrisJson,
                'status' => 'active',
                'created_at' => now(),
                'updated_at' => now(),
            ]);

            DB::commit();

            return redirect()->route('developer.apps.show', $appId)
                ->with('success', 'Application created successfully.')
                ->with('client_secret', $clientSecret);

        } catch (\Exception $e) {
            DB::rollBack();
            return back()->withErrors(['error' => 'Failed to create application: ' . $e->getMessage()]);
        }
    }

    public function show(Request $request, $id)
    {
        $app = DB::table('apps')
            ->where('id', $id)
            ->where('owner_id', $request->user()->id)
            ->first();

        if (!$app) {
            abort(404);
        }

        $client = DB::table('oauth_clients')->where('id', $app->client_id)->first();

        return Inertia::render('developer/apps/show', [
            'app' => $app,
            'client_id' => $app->client_id,
            'client_secret' => session('client_secret'), // Only flashed on creation
            'redirect_uris' => json_decode($app->redirect_uris, true) ?? [],
            'stats' => [
                'total_consents' => DB::table('consent_records')->where('app_id', $app->id)->count(),
                'active_consents' => DB::table('consent_records')->where('app_id', $app->id)->where('status', 'active')->count(),
            ]
        ]);
    }
}
