<?php

namespace App\Http\Controllers\Api\Compliance;

use App\Http\Controllers\Controller;
use App\Models\Compliance\DataAccessRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;
use Illuminate\Support\Facades\URL;

class DataExportDownloadController extends Controller
{
    public function __invoke(Request $request, DataAccessRequest $dataRequest): JsonResponse
    {
        if ($dataRequest->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (! $dataRequest->isFulfilled() || ! $dataRequest->data_export_path) {
            return response()->json(['message' => 'Export not ready yet.'], 400);
        }

        if (! Storage::exists($dataRequest->data_export_path)) {
            return response()->json(['message' => 'Export file not found.'], 404);
        }

        $downloadUrl = URL::temporarySignedRoute(
            'compliance.data-export.download-file',
            now()->addMinutes(30),
            ['dataRequest' => $dataRequest->id]
        );

        return response()->json([
            'download_url' => $downloadUrl,
            'expires_at' => now()->addMinutes(30),
            'filename' => basename($dataRequest->data_export_path),
            'generated_at' => $dataRequest->fulfilled_at,
        ]);
    }

    public function download(Request $request, DataAccessRequest $dataRequest)
    {
        if (! $request->hasValidSignature()) {
            return response()->json(['message' => 'Download link has expired.'], 403);
        }

        if ($dataRequest->user_id !== $request->user()->id && ! $request->user()->isAdmin()) {
            return response()->json(['message' => 'Unauthorized.'], 403);
        }

        if (! Storage::exists($dataRequest->data_export_path)) {
            return response()->json(['message' => 'Export file not found.'], 404);
        }

        return Storage::download($dataRequest->data_export_path);
    }
}
