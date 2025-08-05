<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class ConversationParticipant extends Model
{
    use HasFactory;

    protected $fillable = ['conversation_id', 'participant_id', 'participant_type', 'joined_at'];

    public function conversation()
    {
        return $this->belongsTo(Conversation::class);
    }

    public function participant()
    {
        return $this->morphTo();
    }
}