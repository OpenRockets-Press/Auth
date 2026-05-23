<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('countries', function (Blueprint $table) {
            $table->string('code', 2)->primary();
            $table->string('name');
            $table->unsignedTinyInteger('age_of_digital_consent')->default(16);
            $table->boolean('gdpr_applicable')->default(false);
            $table->boolean('coppa_applicable')->default(false);
            $table->unsignedInteger('data_retention_days')->default(365);
            $table->unsignedTinyInteger('requires_parental_consent_below_age')->default(16);
            $table->timestamps();
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('countries');
    }
};
