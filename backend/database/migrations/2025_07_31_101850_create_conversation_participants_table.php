<?php
use Illuminate\Database\Migrations\Migration;
use Illuminate\Database\Schema\Blueprint;
use Illuminate\Support\Facades\Schema;

class CreateConversationParticipantsTable extends Migration
{
    public function up()
    {
        Schema::create('conversation_participants', function (Blueprint $table) {
            $table->id();
            $table->foreignId('conversation_id')->constrained()->onDelete('cascade');
            $table->unsignedBigInteger('participant_id');
            $table->enum('participant_type', ['admin', 'company', 'influencer']);
            $table->timestamp('joined_at')->useCurrent();
            $table->timestamps();
        });
    }

    public function down()
    {
        Schema::dropIfExists('conversation_participants');
    }
}