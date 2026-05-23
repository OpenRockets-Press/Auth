<?php

namespace App\Models\DataHub;

use App\Models\User;
use App\Models\OAuth\App;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsTo;

class UserDataStore extends Model
{
    use HasFactory;

    protected $casts = [
        'value' => 'array',
    ];

    protected $fillable = [
        'user_id',
        'app_id',
        'key',
        'value',
    ];

    public function user(): BelongsTo
    {
        return $this->belongsTo(User::class);
    }

    public function app(): BelongsTo
    {
        return $this->belongsTo(App::class);
    }

    public function getValue(string $key, mixed $default = null): mixed
    {
        if (!is_array($this->value)) {
            return $default;
        }

        return data_get($this->value, $key, $default);
    }

    public function setValue(string $key, mixed $value): void
    {
        $data = is_array($this->value) ? $this->value : [];
        data_set($data, $key, $value);
        $this->update(['value' => $data]);
    }
}
