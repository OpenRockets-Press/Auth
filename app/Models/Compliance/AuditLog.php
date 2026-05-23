<?php

namespace App\Models\Compliance;

use App\Models\User;
use App\Models\OAuth\App;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class AuditLog extends Model
{
    use HasFactory;

    public $timestamps = false;

    protected $casts = [
        'event_data' => 'array',
        'created_at' => 'datetime',
    ];

    protected $fillable = [
        'user_id',
        'app_id',
        'event_type',
        'event_data',
        'ip_address',
        'user_agent',
    ];

    protected static function booted(): void
    {
        static::creating(function (AuditLog $log) {
            $log->created_at = now();
        });

        static::updating(function () {
            return false;
        });

        static::deleting(function () {
            return false;
        });
    }

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function app(): BelongsTo
    {
        return $this->belongsTo(App::class);
    }
}
