<?php

namespace App\Models;

use Illuminate\Foundation\Auth\User as Authenticatable;
use Laravel\Sanctum\HasApiTokens;
use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Support\Facades\Cache;

class User extends Authenticatable
{
    use HasApiTokens, HasFactory;

    protected $fillable = [
        'email', 'password', 'client_type', 'email_verified', 'verification_token',
        'company_name', 'subscription_plan', 'subscription_expires_at'
    ];

    protected $hidden = ['password', 'verification_token'];

    public function company()
    {
        return $this->hasOne(Company::class);
    }

    public function influencer()
    {
        return $this->hasOne(Influencer::class);
    }

    public function conversations()
    {
        return $this->hasManyThrough(
            Conversation::class,
            ConversationParticipant::class,
            'participant_id',
            'id',
            'id',
            'conversation_id'
        )->where('participant_type', self::class);
    }

    public function sentMessages()
    {
        return $this->morphMany(Message::class, 'sender');
    }

    public function readMessages()
    {
        return $this->morphMany(MessageRead::class, 'reader');
    }

    public function getNameAttribute()
    {
        if ($this->client_type === 'company') {
            return $this->company_name ?? $this->company->company_name ?? 'Entreprise';
        } elseif ($this->client_type === 'influencer') {
            return $this->influencer->full_name ?? 'Influenceur';
        } else {
            return 'Admin';
        }
    }

    public function getImageUrlAttribute()
    {
        if ($this->client_type === 'company') {
            return $this->company->logo ?? 'https://via.placeholder.com/40?text=Logo';
        } elseif ($this->client_type === 'influencer') {
            return $this->influencer->photo_de_profil ?? 'https://via.placeholder.com/40?text=Profile';
        } else {
            return 'https://via.placeholder.com/40?text=Admin';
        }
    }

    public function getIsOnlineAttribute()
    {
        return Cache::has('user-online-' . $this->id);
    }
}