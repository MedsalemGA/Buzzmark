<?php

namespace App\Http\Controllers;

use Illuminate\Http\Request;
use App\Models\Conversation;
use App\Models\ConversationParticipant;
use App\Models\Message;
use Illuminate\Support\Facades\Auth;

class ConversationController extends Controller
{
    public function index()
    {
        $user = Auth::user();

        $conversations = Conversation::whereHas('participants', function ($query) use ($user) {
            $query->where('participant_id', $user->id)
                  ->where('participant_type', get_class($user));
        })->with(['messages' => function ($query) {
            $query->latest()->first();
        }, 'participants.participant'])->get();

        $formattedConversations = $conversations->map(function ($conversation) {
            $lastMessage = $conversation->messages->first();
            $otherParticipants = $conversation->participants->filter(function ($participant) {
                return $participant->participant_id !== Auth::id();
            });

            $name = $conversation->type === 'group' 
                ? 'Groupe ' . $conversation->id 
                : $otherParticipants->first()->participant->name ?? 'Utilisateur';

            return [
                'id' => $conversation->id,
                'name' => $name,
                'lastMessage' => $lastMessage ? $lastMessage->content : '',
                'lastMessageTimestamp' => $lastMessage ? $lastMessage->sent_at : null,
                'type' => $otherParticipants->first()->participant->client_type ?? 'admin',
                'imageUrl' => $otherParticipants->first()->participant->image_url ?? 'https://via.placeholder.com/40',
                'isOnline' => $otherParticipants->first()->participant->is_online ?? false,
                'messages' => [],
            ];
        });

        return response()->json($formattedConversations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'participants' => 'required|array',
            'participants.*.id' => 'required|exists:users,id',
            'type' => 'required|in:private,group',
        ]);

        $user = Auth::user();

        $conversation = Conversation::create([
            'type' => $request->type,
        ]);

        ConversationParticipant::create([
            'conversation_id' => $conversation->id,
            'participant_id' => $user->id,
            'participant_type' => get_class($user),
            'joined_at' => now(),
        ]);

        foreach ($request->participants as $participant) {
            ConversationParticipant::create([
                'conversation_id' => $conversation->id,
                'participant_id' => $participant['id'],
                'participant_type' => User::class,
                'joined_at' => now(),
            ]);
        }

        return response()->json([
            'id' => $conversation->id,
            'name' => $request->type === 'group' ? 'Groupe ' . $conversation->id : '',
            'lastMessage' => '',
            'lastMessageTimestamp' => null,
            'type' => $request->type,
            'imageUrl' => 'https://via.placeholder.com/40',
            'isOnline' => false,
            'messages' => [],
        ], 201);
    }

    public function show($id)
    {
        $user = Auth::user();

        $conversation = Conversation::whereHas('participants', function ($query) use ($user) {
            $query->where('participant_id', $user->id)
                  ->where('participant_type', get_class($user));
        })->with(['messages' => function ($query) {
            $query->with(['sender', 'reads']);
        }, 'participants.participant'])->findOrFail($id);

        $otherParticipants = $conversation->participants->filter(function ($participant) {
            return $participant->participant_id !== Auth::id();
        });

        $name = $conversation->type === 'group' 
            ? 'Groupe ' . $conversation->id 
            : $otherParticipants->first()->participant->name ?? 'Utilisateur';

        $formattedMessages = $conversation->messages->map(function ($message) use ($user) {
            $status = $message->status;
            if ($message->reads->where('reader_id', '!=', $user->id)->count() > 0) {
                $status = 'read';
            } elseif ($message->status === 'sent' && !$message->reads->isEmpty()) {
                $status = 'delivered';
            }

            return [
                'id' => $message->id,
                'content' => $message->content,
                'timestamp' => $message->sent_at,
                'isSentByMe' => $message->sender_id === $user->id && $message->sender_type === get_class($user),
                'status' => $status,
            ];
        });

        return response()->json([
            'id' => $conversation->id,
            'name' => $name,
            'lastMessage' => $conversation->messages->last()->content ?? '',
            'lastMessageTimestamp' => $conversation->messages->last()->sent_at ?? null,
            'type' => $otherParticipants->first()->participant->client_type ?? 'admin',
            'imageUrl' => $otherParticipants->first()->participant->image_url ?? 'https://via.placeholder.com/40',
            'isOnline' => $otherParticipants->first()->participant->is_online ?? false,
            'messages' => $formattedMessages,
        ]);
    }
}