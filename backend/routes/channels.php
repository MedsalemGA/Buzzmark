<?php

use Illuminate\Support\Facades\Broadcast;

/*
|--------------------------------------------------------------------------
| Broadcast Channels
|--------------------------------------------------------------------------
|
| Here you may register all of the event broadcasting channels that your
| application supports. The given channel authorization callbacks are
| used to check if an authenticated user can listen to the channel.
|
*/

Broadcast::channel('App.Models.User.{id}', function ($user, $id) {
    return (int) $user->id === (int) $id;
});
Broadcast::channel('conversation.{conversationId}', function ($user, $conversationId) {
    return \App\Models\Conversation::whereHas('participants', function ($query) use ($user) {
        $query->where('participant_id', $user->id)
              ->where('participant_type', get_class($user));
    })->find($conversationId) ? true : false;
});