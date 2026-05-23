<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->foreignId('requesting_app_id')->constrained('apps')->onDelete('cascade');
            $table->foreignId('target_app_id')->constrained('apps')->onDelete('cascade');
            $table->json('data_keys');
            $table->string('status')->default('pending');
            $table->string('user_consent_status')->default('pending');
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index(['requesting_app_id', 'target_app_id']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_requests');
    }
};
