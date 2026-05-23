<?php

namespace App\Models\OAuth;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;
use Illuminate\Database\Eloquent\SoftDeletes;
use Laravel\Passport\Client;

class App extends Model
{
    use HasFactory, SoftDeletes;

    protected $casts = [
        'redirect_uris' => 'array',
        'is_system' => 'boolean',
        'verified_at' => 'datetime',
        'suspended_at' => 'datetime',
    ];

    protected $fillable = [
        'owner_id',
        'client_id',
        'name',
        'description',
        'icon_url',
        'status',
        'is_system',
        'redirect_uris',
        'homepage_url',
        'privacy_policy_url',
        'terms_url',
        'category',
        'verified_at',
        'suspended_at',
    ];

    public function owner(): BelongsTo
    {
        return $this->belongsTo(User::class, 'owner_id');
    }

    public function client(): BelongsTo
    {
        return $this->belongsTo(Client::class, 'client_id');
    }

    public function scopes(): HasMany
    {
        return $this->hasMany(AppScope::class);
    }

    public function consentRecords(): HasMany
    {
        return $this->hasMany(ConsentRecord::class);
    }

    public function isVerified(): bool
    {
        return $this->status === 'verified' || $this->is_system;
    }

    public function isSuspended(): bool
    {
        return $this->status === 'suspended' || $this->suspended_at !== null;
    }

    public function isActive(): bool
    {
        return ! $this->isSuspended() && $this->status !== 'rejected';
    }
}
