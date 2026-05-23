<?php

namespace App\Models\DataHub;

use App\Models\OAuth\App;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataRequest extends Model
{
    use HasFactory;

    protected $casts = [
        'data_keys' => 'array',
    ];

    protected $fillable = [
        'user_id',
        'requesting_app_id',
        'target_app_id',
        'data_keys',
        'status',
        'user_consent_status',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function requestingApp(): BelongsTo
    {
        return $this->belongsTo(App::class, 'requesting_app_id');
    }

    public function targetApp(): BelongsTo
    {
        return $this->belongsTo(App::class, 'target_app_id');
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isApproved(): bool
    {
        return $this->status === 'approved';
    }

    public function isDenied(): bool
    {
        return $this->status === 'denied';
    }

    public function approve(): void
    {
        $this->update(['status' => 'approved']);
    }

    public function deny(): void
    {
        $this->update(['status' => 'denied']);
    }

    public function consentGranted(): void
    {
        $this->update(['user_consent_status' => 'granted']);
    }

    public function consentDenied(): void
    {
        $this->update(['user_consent_status' => 'denied']);
    }
}
