<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->string('state')->nullable()->after('country_code');
            $table->string('city')->nullable()->after('state');
            $table->string('onboarding_status')->default('incomplete')->after('parental_consent_status');
            $table->timestamp('onboarding_completed_at')->nullable()->after('onboarding_status');
        });
    }

    public function down(): void
    {
        Schema::table('user_profiles', function (Blueprint $table) {
            $table->dropColumn(['state', 'city', 'onboarding_status', 'onboarding_completed_at']);
        });
    }
};
