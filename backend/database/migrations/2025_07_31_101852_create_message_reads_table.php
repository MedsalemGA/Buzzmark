<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessageReadsTable extends Migration
{
    public function up()
    {
        Schema::create('message_reads', function (Blueprint $table) {
            $table->id();
            $table->foreignId('message_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('reader_id');
            $table->enum('reader_type', ['admin', 'company', 'influencer']);
            $table->timestamp('read_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('message_reads');
    }
}