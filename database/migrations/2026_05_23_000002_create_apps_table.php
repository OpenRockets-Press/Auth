<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('apps', function (Blueprint $table) {
            $table->id();
            $table->foreignId('owner_id')->constrained('users')->onDelete('cascade');
            $table->unsignedBigInteger('client_id')->nullable()->unique();
            $table->string('name');
            $table->text('description')->nullable();
            $table->string('icon_url')->nullable();
            $table->string('status')->default('pending');
            $table->boolean('is_system')->default(false);
            $table->json('redirect_uris');
            $table->string('homepage_url')->nullable();
            $table->string('privacy_policy_url')->nullable();
            $table->string('terms_url')->nullable();
            $table->string('category')->nullable();
            $table->timestamp('verified_at')->nullable();
            $table->timestamp('suspended_at')->nullable();
            $table->timestamps();

            $table->foreign('client_id')->references('id')->on('oauth_clients')->nullOnDelete();
            $table->index('status');
            $table->index('is_system');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('apps');
    }
};
