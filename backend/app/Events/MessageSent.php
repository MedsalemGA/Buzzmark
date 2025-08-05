<?php

namespace App\Events;

use Illuminate\Broadcasting\Channel;
use Illuminate\Broadcasting\InteractsWithSockets;
use Illuminate\Contracts\Broadcasting\ShouldBroadcast;
use Illuminate\Foundation\Events\Dispatchable;
use App\Models\Message;

class MessageSent implements ShouldBroadcast
{
    use Dispatchable, InteractsWithSockets;

    public $message;
    public $conversationId;

    public function __construct(Message $message, $conversationId)
    {
        $this->message = $message;
        $this->conversationId = $conversationId;
    }

    public function broadcastOn()
    {
        return new Channel('conversation.' . $this->conversationId);
    }

    public function broadcastAs()
    {
        return 'message.sent';
    }
}