<?php

namespace App\Models\DataHub;

use App\Models\User;
use App\Models\OAuth\App;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataSharingAgreement extends Model
{
    use HasFactory;

    protected $casts = [
        'data_keys' => 'array',
        'granted_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    protected $fillable = [
        'user_id',
        'source_app_id',
        'target_app_id',
        'data_keys',
        'consent_status',
        'granted_at',
        'revoked_at',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function sourceApp(): BelongsTo
    {
        return $this->belongsTo(App::class, 'source_app_id');
    }

    public function targetApp(): BelongsTo
    {
        return $this->belongsTo(App::class, 'target_app_id');
    }

    public function isGranted(): bool
    {
        return $this->consent_status === 'granted' && $this->revoked_at === null;
    }

    public function isRevoked(): bool
    {
        return $this->revoked_at !== null;
    }

    public function grant(): void
    {
        $this->update([
            'consent_status' => 'granted',
            'granted_at' => now(),
        ]);
    }

    public function revoke(): void
    {
        $this->update([
            'revoked_at' => now(),
        ]);
    }
}
