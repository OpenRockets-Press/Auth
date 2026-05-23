<?php

namespace App\Http\Controllers\Api\Compliance;

use App\Http\Controllers\Controller;
use App\Models\Compliance\DataAccessRequest;
use Illuminate\Http\JsonResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Storage;

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

        $content = Storage::get($dataRequest->data_export_path);

        return response()->json([
            'data' => json_decode($content, true),
            'filename' => basename($dataRequest->data_export_path),
            'generated_at' => $dataRequest->fulfilled_at,
        ]);
    }
}
