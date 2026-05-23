<?php

namespace App\Models\Admin;

use App\Models\User;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Relations\BelongsToMany;

class Role extends Model
{
    use HasFactory;

    protected $casts = [
        'permissions' => 'array',
    ];

    protected $fillable = [
        'name',
        'description',
        'permissions',
    ];

    public function users(): BelongsToMany
    {
        return $this->belongsToMany(User::class);
    }

    public function hasPermission(string $permission): bool
    {
        if (! is_array($this->permissions)) {
            return false;
        }

        return in_array($permission, $this->permissions, true);
    }

    public function isSuperAdmin(): bool
    {
        return $this->name === 'super_admin';
    }
}
