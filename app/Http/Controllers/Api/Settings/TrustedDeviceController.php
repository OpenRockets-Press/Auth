<?php

namespace App\Http\Controllers\Api\Settings;

use App\Http\Controllers\Controller;
use App\Services\RiskAssessmentService;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;

class TrustedDeviceController extends Controller
{
    public function __construct(
        protected RiskAssessmentService $riskService,
    ) {}

    public function index(Request $request): JsonResponse
    {
        $devices = $request->user()->trustedDevices()
            ->latest('last_used_at')
            ->get()
            ->map(fn ($device) => [
                'id' => $device->id,
                'device_name' => $device->device_name,
                'ip_address' => $device->ip_address,
                'trusted_at' => $device->trusted_at,
                'last_used_at' => $device->last_used_at,
            ]);

        return response()->json(['devices' => $devices]);
    }

    public function destroy(Request $request, int $deviceId): JsonResponse
    {
        $device = $request->user()->trustedDevices()->findOrFail($deviceId);

        $device->delete();

        return response()->json(['message' => 'Device removed.']);
    }

    public function trustCurrent(Request $request): JsonResponse
    {
        $validated = $request->validate([
            'device_name' => ['required', 'string', 'max:255'],
        ]);

        $device = $this->riskService->trustDevice(
            $request->user(),
            $validated['device_name'],
            $request->ip(),
            $request->userAgent() ?? 'unknown'
        );

        return response()->json([
            'message' => 'Device trusted.',
            'device' => [
                'id' => $device->id,
                'device_name' => $device->device_name,
                'trusted_at' => $device->trusted_at,
            ],
        ], 201);
    }
}
