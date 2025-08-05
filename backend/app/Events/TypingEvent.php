<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;

class TypingEvent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public $userId;
    public $conversationId;
    public $isTyping;

    public function __construct($userId, $conversationId, $isTyping)
    {
        $this->userId = $userId;
        $this->conversationId = $conversationId;
        $this->isTyping = $isTyping;
    }

    public function broadcastOn()
    {
        return new Channel('conversation.' . $this->conversationId);
    }

    public function broadcastAs()
    {
        return 'typing';
    }
}