<?php

use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

return new class extends Migration
{
    /**
     * Run the migrations.
     */
   

    /**
     * Reverse the migrations.
     */
    // database/migrations/xxxx_xx_xx_add_subscription_expires_at_to_users_table.php

public function up()
{
    Schema::table('users', function (Blueprint $table) {
        $table->dateTime('subscription_expires_at')->nullable();
    });
}

public function down()
{
    Schema::table('users', function (Blueprint $table) {
        $table->dropColumn('subscription_expires_at');
    });
}

};
