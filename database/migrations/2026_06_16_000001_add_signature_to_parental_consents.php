<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('parental_consents', function (Blueprint $table) {
            $table->longText('signature')->nullable();
            $table->boolean('is_adult_self_consent')->default(false);
        });

        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('phone_number')->nullable();
            $table->string('school')->nullable();
        });
    }

    public function down(): void
    {
        Schema::table('parental_consents', function (Blueprint $table) {
            $table->dropColumn(['signature', 'is_adult_self_consent']);
        });

        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn(['phone_number', 'school']);
        });
    }
};
