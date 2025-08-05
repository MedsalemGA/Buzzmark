<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateMessagesTable extends Migration
{
    public function up()
    {
        Schema::create('messages', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('sender_id');
            $table->enum('sender_type', ['admin', 'company', 'influencer']);
            $table->text('content');
            $table->timestamp('sent_at')->useCurrent();
            $table->enum('status', ['sent', 'delivered', 'read'])->default('sent');
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('messages');
    }
}