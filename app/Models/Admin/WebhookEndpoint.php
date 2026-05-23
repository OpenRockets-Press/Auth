<?php

namespace App\Models\Admin;

use App\Models\OAuth\App;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;
use Illuminate\Database\Eloquent\Relations\HasMany;

class WebhookEndpoint extends Model
{
    use HasFactory;

    protected $casts = [
        'events' => 'array',
        'is_active' => 'boolean',
    ];

    protected $fillable = [
        'app_id',
        'url',
        'secret',
        'events',
        'is_active',
    ];

    protected $hidden = [
        'secret',
    ];

    public function app(): BelongsTo
    {
        return $this->belongsTo(App::class);
    }

    public function deliveries(): HasMany
    {
        return $this->hasMany(WebhookDelivery::class);
    }

    public function handlesEvent(string $event): bool
    {
        if (! is_array($this->events)) {
            return false;
        }

        return in_array($event, $this->events, true) || in_array('*', $this->events, true);
    }

    public function generateSignature(string $payload): string
    {
        return hash_hmac('sha256', $payload, $this->secret);
    }
}
