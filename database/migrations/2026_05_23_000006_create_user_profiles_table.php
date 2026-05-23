<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('user_profiles', function (Blueprint $table) {
            $table->id();
            $table->foreignId('user_id')->constrained()->onDelete('cascade');
            $table->date('date_of_birth')->nullable();
            $table->string('country_code', 2)->nullable();
            $table->boolean('age_verified')->default(false);
            $table->string('age_verification_method')->nullable();
            $table->boolean('parental_consent_required')->default(false);
            $table->string('parental_consent_status')->default('not_required');
            $table->timestamps();

            $table->foreign('country_code')->references('code')->on('countries')->nullOnDelete();
            $table->index('parental_consent_required');
            $table->index('parental_consent_status');
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('user_profiles');
    }
};
