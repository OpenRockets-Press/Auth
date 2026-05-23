<?php

namespace App\Models\Compliance;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataRetentionPolicy extends Model
{
    use HasFactory;

    protected $fillable = [
        'country_code',
        'data_type',
        'retention_days',
        'auto_delete',
    ];

    protected $casts = [
        'retention_days' => 'integer',
        'auto_delete' => 'boolean',
    ];

    public function country(): BelongsTo
    {
        return $this->belongsTo(Country::class, 'country_code', 'code');
    }

    public function isExpired(string $createdAt): bool
    {
        return now()->diffInDays($createdAt) > $this->retention_days;
    }

    public function shouldAutoDelete(): bool
    {
        return $this->auto_delete;
    }
}
