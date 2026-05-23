<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_sharing_agreements', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('source_app_id')->constrained('apps')->onDelete('cascade');
            $table->foreignId('target_app_id')->constrained('apps')->onDelete('cascade');
            $table->json('data_keys');
            $table->string('consent_status')->default('pending');
            $table->timestamp('granted_at')->nullable();
            $table->timestamp('revoked_at')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'source_app_id', 'target_app_id']);
            $table->index('consent_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_sharing_agreements');
    }
};
