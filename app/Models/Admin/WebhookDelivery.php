<?php

namespace App\Models\Admin;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class WebhookDelivery extends Model
{
    use HasFactory;

    protected $casts = [
        'payload' => 'array',
        'last_attempt_at' => 'datetime',
        'response_code' => 'integer',
    ];

    protected $fillable = [
        'webhook_endpoint_id',
        'event_type',
        'payload',
        'status',
        'attempts',
        'last_attempt_at',
        'response_code',
        'response_body',
    ];

    public function webhookEndpoint(): BelongsTo
    {
        return $this->belongsTo(WebhookEndpoint::class);
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isDelivered(): bool
    {
        return $this->status === 'delivered';
    }

    public function isFailed(): bool
    {
        return $this->status === 'failed';
    }

    public function markDelivered(int $responseCode, ?string $responseBody = null): void
    {
        $this->update([
            'status' => 'delivered',
            'response_code' => $responseCode,
            'response_body' => $responseBody,
            'last_attempt_at' => now(),
        ]);
    }

    public function markFailed(int $responseCode, ?string $responseBody = null): void
    {
        $this->update([
            'status' => 'failed',
            'response_code' => $responseCode,
            'response_body' => $responseBody,
            'last_attempt_at' => now(),
        ]);
    }

    public function incrementAttempts(): void
    {
        $this->increment('attempts');
        $this->update(['last_attempt_at' => now()]);
    }

    public function shouldRetry(): bool
    {
        return $this->isPending() && $this->attempts < 5;
    }
}
