<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\Message;
use App\Models\MessageRead;
use Illuminate\Support\Facades\Auth;
use App\Events\TypingEvent;
use App\Events\MessageSent;

class MessagingController extends Controller
{
    public function store(Request $request, $conversationId)
    {
        $request->validate([
            'content' => 'required|string',
        ]);

        $user = Auth::user();

        $conversation = Conversation::whereHas('participants', function ($query) use ($user) {
            $query->where('participant_id', $user->id)
                  ->where('participant_type', get_class($user));
        })->findOrFail($conversationId);

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'sender_id' => $user->id,
            'sender_type' => get_class($user),
            'content' => $request->content,
            'sent_at' => now(),
            'status' => 'sent',
        ]);

        broadcast(new MessageSent($message, $conversation->id))->toOthers();

        return response()->json([
            'id' => $message->id,
            'content' => $message->content,
            'timestamp' => $message->sent_at,
            'isSentByMe' => true,
            'status' => $message->status,
        ], 201);
    }

    public function destroy($conversationId, $messageId)
    {
        $user = Auth::user();

        $message = Message::where('conversation_id', $conversationId)
            ->where('sender_id', $user->id)
            ->where('sender_type', get_class($user))
            ->findOrFail($messageId);

        $message->delete();

        return response()->json(['message' => 'Message deleted']);
    }

    public function forward(Request $request, $conversationId, $messageId)
    {
        $request->validate([
            'target_conversation_id' => 'required|exists:conversations,id',
        ]);

        $user = Auth::user();

        $originalMessage = Message::where('conversation_id', $conversationId)
            ->findOrFail($messageId);

        $targetConversation = Conversation::whereHas('participants', function ($query) use ($user) {
            $query->where('participant_id', $user->id)
                  ->where('participant_type', get_class($user));
        })->findOrFail($request->target_conversation_id);

        $newMessage = Message::create([
            'conversation_id' => $targetConversation->id,
            'sender_id' => $user->id,
            'sender_type' => get_class($user),
            'content' => $originalMessage->content,
            'sent_at' => now(),
            'status' => 'sent',
        ]);

        broadcast(new MessageSent($newMessage, $targetConversation->id))->toOthers();

        return response()->json([
            'id' => $newMessage->id,
            'content' => $newMessage->content,
            'timestamp' => $newMessage->sent_at,
            'isSentByMe' => true,
            'status' => $newMessage->status,
        ], 201);
    }

    public function markAsRead(Request $request, $conversationId, $messageId)
    {
        $user = Auth::user();

        $message = Message::where('conversation_id', $conversationId)
            ->whereHas('conversation.participants', function ($query) use ($user) {
                $query->where('participant_id', $user->id)
                      ->where('participant_type', get_class($user));
            })->findOrFail($messageId);

        $read = MessageRead::firstOrCreate([
            'message_id' => $message->id,
            'reader_id' => $user->id,
            'reader_type' => get_class($user),
        ], [
            'read_at' => now(),
        ]);

        $message->update(['status' => 'read']);

        return response()->json([
            'id' => $message->id,
            'status' => 'read',
        ]);
    }

    public function sendTyping(Request $request, $conversationId)
    {
        $user = Auth::user();

        $conversation = Conversation::whereHas('participants', function ($query) use ($user) {
            $query->where('participant_id', $user->id)
                  ->where('participant_type', get_class($user));
        })->findOrFail($conversationId);

        broadcast(new TypingEvent($user->id, $conversation->id, true))->toOthers();

        return response()->json(['message' => 'Typing status sent']);
    }
}