<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Company extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'company_name', 'industry', 'phone_number', 'address', 'logo', 'description','numero_commercial'
    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function offers()
    {
        return $this->hasMany(Offer::class);
    }
    public function conversations()
    {
        return $this->morphMany(ConversationParticipant::class, 'participant');
    }

    public function sentMessages()
    {
        return $this->morphMany(Message::class, 'sender');
    }
}
