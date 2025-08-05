<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Offer extends Model
{
    protected $fillable = [
        'user_id', 'name', 'budget', 'deadline', 'status', 'views', 'shares', 'interactions',
    ];

    // Relation avec l'utilisateur
    public function user()
    {
        return $this->belongsTo(User::class, 'user_id');
    }
    
}