<?php

namespace App\Models\DataHub;

use App\Models\OAuth\App;
use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataAccessToken extends Model
{
    use HasFactory;

    protected $casts = [
        'scopes' => 'array',
        'expires_at' => 'datetime',
    ];

    protected $fillable = [
        'user_id',
        'requesting_app_id',
        'granting_app_id',
        'scopes',
        'token',
        'expires_at',
    ];

    protected $hidden = [
        'token',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function requestingApp(): BelongsTo
    {
        return $this->belongsTo(App::class, 'requesting_app_id');
    }

    public function grantingApp(): BelongsTo
    {
        return $this->belongsTo(App::class, 'granting_app_id');
    }

    public function isExpired(): bool
    {
        return $this->expires_at->isPast();
    }

    public function isValid(): bool
    {
        return ! $this->isExpired();
    }

    public static function findByToken(string $token): ?static
    {
        return static::where('token', $token)->first();
    }
}
