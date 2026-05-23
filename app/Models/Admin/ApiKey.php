<?php

namespace App\Models\Admin;

use App\Models\OAuth\App;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class ApiKey extends Model
{
    use HasFactory;

    protected $casts = [
        'scopes' => 'array',
        'expires_at' => 'datetime',
        'last_used_at' => 'datetime',
    ];

    protected $fillable = [
        'user_id',
        'app_id',
        'name',
        'key_hash',
        'scopes',
        'expires_at',
        'last_used_at',
    ];

    protected $hidden = [
        'key_hash',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function app(): BelongsTo
    {
        return $this->belongsTo(App::class);
    }

    public function isExpired(): bool
    {
        return $this->expires_at !== null && $this->expires_at->isPast();
    }

    public function isValid(): bool
    {
        return ! $this->isExpired();
    }

    public function touchUsage(): void
    {
        $this->update(['last_used_at' => now()]);
    }

    public static function findByPlainKey(string $plainKey): ?static
    {
        $hashed = self::hashKey($plainKey);

        return static::where('key_hash', $hashed)->first();
    }

    public static function generateKey(): string
    {
        return bin2hex(random_bytes(32));
    }

    public static function hashKey(string $plainKey): string
    {
        return hash_hmac('sha256', $plainKey, config('app.key'));
    }
}
