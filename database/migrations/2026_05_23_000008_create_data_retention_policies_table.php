<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    public function up(): void
    {
        Schema::create('data_retention_policies', function (Blueprint $table) {
            $table->id();
            $table->string('country_code', 2);
            $table->string('data_type');
            $table->unsignedInteger('retention_days');
            $table->boolean('auto_delete')->default(false);
            $table->timestamps();

            $table->foreign('country_code')->references('code')->on('countries')->cascadeOnDelete();
            $table->unique(['country_code', 'data_type']);
        });
    }

    public function down(): void
    {
        Schema::dropIfExists('data_retention_policies');
    }
};
