<?php

namespace App\Models\Compliance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ParentalConsent extends Model
{
    use HasFactory;

    protected $casts = [
        'verified_at' => 'datetime',
        'granted_at' => 'datetime',
        'revoked_at' => 'datetime',
    ];

    protected $fillable = [
        'user_id',
        'parent_email',
        'parent_name',
        'consent_method',
        'consent_status',
        'verification_token',
        'verified_at',
        'granted_at',
        'revoked_at',
        'ip_address',
        'signature',
        'is_adult_self_consent',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isGranted(): bool
    {
        return $this->consent_status === 'granted' && $this->revoked_at === null;
    }

    public function isPending(): bool
    {
        return $this->consent_status === 'pending';
    }

    public function isDenied(): bool
    {
        return $this->consent_status === 'denied';
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

    public function deny(): void
    {
        $this->update([
            'consent_status' => 'denied',
        ]);
    }

    public function revoke(): void
    {
        $this->update([
            'revoked_at' => now(),
        ]);
    }
}
