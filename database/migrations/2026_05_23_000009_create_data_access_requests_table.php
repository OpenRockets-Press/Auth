<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_access_requests', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->string('request_type');
            $table->string('status')->default('pending');
            $table->string('requested_by')->default('user');
            $table->timestamp('fulfilled_at')->nullable();
            $table->string('data_export_path')->nullable();
            $table->timestamps();

            $table->index(['user_id', 'status']);
            $table->index('request_type');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_access_requests');
    }
};
