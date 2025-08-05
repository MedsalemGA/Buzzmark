<?php
namespace App\Models;

use Illuminate\Database\Eloquent\Factories\HasFactory;
use Illuminate\Database\Eloquent\Model;

class Influencer extends Model
{
    use HasFactory;

    protected $fillable = [
        'user_id', 'full_name', 'phone_number', 'address', 'photo_de_profil', 'date_de_naissance','tiktok_url','instagram_url','youtube_url'
       

    ];

    public function user()
    {
        return $this->belongsTo(User::class);
    }

    public function offers()
    {
        return $this->hasMany(Offer::class);
    }
}
