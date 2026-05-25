<?php

namespace App\Http\Controllers\Api\Admin;

use App\Http\Controllers\Controller;
use App\Http\Resources\Admin\UserResource;
use App\Http\Resources\Compliance\AuditLogResource;
use App\Http\Resources\Compliance\CountryResource;
use App\Http\Resources\Compliance\DataAccessRequestResource;
use App\Http\Resources\OAuth\AppResource;
use App\Http\Resources\OAuth\ConsentRecordResource;
use App\Http\Resources\Social\SocialAccountResource;
use App\Jobs\FulfillDataDeletion;
use App\Jobs\FulfillDataExport;
use App\Models\Compliance\AuditLog;
use App\Models\Compliance\Country;
use App\Models\Compliance\DataAccessRequest;
use App\Models\OAuth\App;
use App\Models\OAuth\ConsentRecord;
use App\Models\User;
use App\Services\ComplianceService;
use App\Services\OAuthService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class AdminController extends Controller
{
    public function __construct(
        protected OAuthService $oauthService,
        protected ComplianceService $complianceService,
    ) {}

    public function users(Request $request): JsonResponse
    {
        $query = User::with('profile');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('search')) {
            $search = $request->string('search')->limit(100)->toString();
            $escaped = str_replace(['%', '_'], ['\\%', '\\_'], $search);
            $query->where(function ($q) use ($escaped) {
                $q->where('name', 'like', "%{$escaped}%")
                    ->orWhere('email', 'like', "%{$escaped}%");
            });
        }

        $users = $query->latest()->paginate(20);

        return response()->json(UserResource::collection($users));
    }

    public function user(User $user): JsonResponse
    {
        $user->load(['profile', 'consentRecords.app', 'socialAccounts', 'roles']);

        return response()->json(new UserResource($user));
    }

    public function userConsents(User $user): JsonResponse
    {
        $consents = ConsentRecord::where('user_id', $user->id)
            ->with('app')
            ->latest()
            ->paginate(20);

        return response()->json(ConsentRecordResource::collection($consents));
    }

    public function userSocialAccounts(User $user): JsonResponse
    {
        $accounts = $user->socialAccounts()->latest()->get();

        return response()->json(SocialAccountResource::collection($accounts));
    }

    public function userDataRequests(User $user): JsonResponse
    {
        $requests = DataAccessRequest::where('user_id', $user->id)
            ->latest()
            ->paginate(20);

        return response()->json(DataAccessRequestResource::collection($requests));
    }

    public function userAuditLogs(User $user): JsonResponse
    {
        $logs = AuditLog::where('user_id', $user->id)
            ->with('app')
            ->latest()
            ->paginate(50);

        return response()->json(AuditLogResource::collection($logs));
    }

    public function unlockUser(Request $request, User $user): JsonResponse
    {
        $this->authorize('suspend', $user);

        $user->update([
            'locked_until' => null,
            'failed_login_attempts' => 0,
        ]);

        return response()->json(['message' => 'User unlocked.']);
    }

    public function suspendUser(Request $request, User $user): JsonResponse
    {
        $this->authorize('suspend', $user);

        $user->update(['status' => 'suspended']);

        return response()->json(['message' => 'User suspended.']);
    }

    public function unsuspendUser(Request $request, User $user): JsonResponse
    {
        $this->authorize('suspend', $user);

        $user->update(['status' => 'active']);

        return response()->json(['message' => 'User unsuspended.']);
    }

    public function apps(Request $request): JsonResponse
    {
        $query = App::with('owner');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('category')) {
            $query->where('category', $request->category);
        }

        $apps = $query->latest()->paginate(20);

        return response()->json(AppResource::collection($apps));
    }

    public function verifyApp(Request $request, App $app): JsonResponse
    {
        $this->authorize('verify', $app);

        $app = $this->oauthService->verifyApp($app, $request->user());

        return response()->json(new AppResource($app));
    }

    public function rejectApp(Request $request, App $app): JsonResponse
    {
        $this->authorize('reject', $app);

        $app = $this->oauthService->rejectApp($app, $request->user());

        return response()->json(new AppResource($app));
    }

    public function suspendApp(Request $request, App $app): JsonResponse
    {
        $this->authorize('suspend', $app);

        $app = $this->oauthService->suspendApp($app, $request->user());

        return response()->json(new AppResource($app));
    }

    public function auditLogs(Request $request): JsonResponse
    {
        $query = AuditLog::with(['user', 'app']);

        if ($request->has('event_type')) {
            $query->where('event_type', $request->event_type);
        }

        if ($request->has('user_id')) {
            $query->where('user_id', $request->user_id);
        }

        if ($request->has('app_id')) {
            $query->where('app_id', $request->app_id);
        }

        if ($request->has('from')) {
            $query->where('created_at', '>=', $request->from);
        }

        if ($request->has('to')) {
            $query->where('created_at', '<=', $request->to);
        }

        $logs = $query->latest()->paginate(50);

        return response()->json(AuditLogResource::collection($logs));
    }

    public function dataRequests(Request $request): JsonResponse
    {
        $query = DataAccessRequest::with('user');

        if ($request->has('status')) {
            $query->where('status', $request->status);
        }

        if ($request->has('request_type')) {
            $query->where('request_type', $request->request_type);
        }

        $requests = $query->latest()->paginate(20);

        return response()->json(DataAccessRequestResource::collection($requests));
    }

    public function fulfillDataRequest(Request $request, DataAccessRequest $dataRequest): JsonResponse
    {
        $this->authorize('fulfill', $dataRequest);

        if ($dataRequest->isExport()) {
            FulfillDataExport::dispatch($dataRequest);

            return response()->json([
                'message' => 'Data export fulfillment queued.',
            ]);
        }

        if ($dataRequest->isDeletion()) {
            FulfillDataDeletion::dispatch($dataRequest);

            return response()->json(['message' => 'Data deletion fulfillment queued.']);
        }

        return response()->json(['message' => 'Unknown request type.'], 400);
    }

    public function analytics(): JsonResponse
    {
        $now = now();
        $yesterday = $now->copy()->subDay();

        $stats = \Illuminate\Support\Facades\DB::selectOne("
            SELECT
                (SELECT COUNT(*) FROM users) AS total_users,
                (SELECT COUNT(*) FROM users WHERE status = 'active') AS active_users,
                (SELECT COUNT(*) FROM users WHERE status = 'suspended') AS suspended_users,
                (SELECT COUNT(*) FROM apps) AS total_apps,
                (SELECT COUNT(*) FROM apps WHERE status = 'verified') AS verified_apps,
                (SELECT COUNT(*) FROM apps WHERE status = 'pending') AS pending_apps,
                (SELECT COUNT(*) FROM consent_records WHERE revoked_at IS NULL) AS total_consents,
                (SELECT COUNT(*) FROM audit_logs) AS total_audit_events,
                (SELECT COUNT(*) FROM data_access_requests WHERE status = 'pending') AS pending_data_requests,
                (SELECT COUNT(*) FROM users WHERE created_at >= ?) AS users_last_24h,
                (SELECT COUNT(*) FROM audit_logs WHERE event_type = 'auth.login.success' AND created_at >= ?) AS logins_last_24h
        ", [$yesterday, $yesterday]);

        return response()->json((array) $stats);
    }

    public function countries(): JsonResponse
    {
        $countries = Country::orderBy('name')->get();

        return response()->json(CountryResource::collection($countries));
    }

    public function updateCountry(Request $request, string $code): JsonResponse
    {
        $country = Country::findOrFail($code);

        $validated = $request->validate([
            'age_of_digital_consent' => ['sometimes', 'integer', 'min:0', 'max:21'],
            'gdpr_applicable' => ['sometimes', 'boolean'],
            'coppa_applicable' => ['sometimes', 'boolean'],
            'data_retention_days' => ['sometimes', 'integer', 'min:1'],
            'requires_parental_consent_below_age' => ['sometimes', 'integer', 'min:0', 'max:21'],
        ]);

        $country->update($validated);

        return response()->json(new CountryResource($country));
    }
}
