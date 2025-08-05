<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;
use Illuminate\Database\Eloquent\Factories\HasFactory;

class MessageRead extends Model
{
    use HasFactory;

    protected $fillable = ['message_id', 'reader_id', 'reader_type', 'read_at'];

    protected $dates = ['read_at'];

    public function message()
    {
        return $this->belongsTo(Message::class);
    }

    public function reader()
    {
        return $this->morphTo();
    }
}