<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('parental_consents', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('parent_email');
            $table->string('parent_name')->nullable();
            $table->string('consent_method')->nullable();
            $table->string('consent_status')->default('pending');
            $table->string('verification_token')->nullable()->unique();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('granted_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->string('ip_address', 45)->nullable();
            $table->timestamps();

            $table->index('consent_status');
            $table->index('parent_email');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('parental_consents');
    }
};
