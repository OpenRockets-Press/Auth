<?php

namespace App\Models\Compliance;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class DataAccessRequest extends Model
{
    use HasFactory;

    protected $casts = [
        'fulfilled_at' => 'datetime',
    ];

    protected $fillable = [
        'user_id',
        'request_type',
        'status',
        'requested_by',
        'fulfilled_at',
        'data_export_path',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function isExport(): bool
    {
        return $this->request_type === 'export';
    }

    public function isDeletion(): bool
    {
        return $this->request_type === 'deletion';
    }

    public function isPending(): bool
    {
        return $this->status === 'pending';
    }

    public function isFulfilled(): bool
    {
        return $this->status === 'fulfilled';
    }

    public function fulfill(?string $exportPath = null): void
    {
        $this->update([
            'status' => 'fulfilled',
            'fulfilled_at' => now(),
            'data_export_path' => $exportPath,
        ]);
    }

    public function reject(): void
    {
        $this->update([
            'status' => 'rejected',
        ]);
    }
}
