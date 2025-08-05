<?php
   namespace App\Models;

   use Illuminate\Database\Eloquent\Factories\HasFactory;
   use Illuminate\Database\Eloquent\Model;
   use Illuminate\Support\Facades\Crypt;

   class Payment extends Model
   {
       use HasFactory;

       protected $fillable = [
           'email',
           'client_type',
           'plan',
           'card_number_encrypted',
           'card_expiry',
           'card_cvv_encrypted',
           'status'
       ];

       protected $hidden = ['card_number_encrypted', 'card_cvv_encrypted'];

       public function setCardNumberEncryptedAttribute($value)
       {
           $this->attributes['card_number_encrypted'] = Crypt::encryptString($value);
       }

       public function getCardNumberEncryptedAttribute($value)
       {
           return Crypt::decryptString($value);
       }

       public function setCardCvvEncryptedAttribute($value)
       {
           $this->attributes['card_cvv_encrypted'] = Crypt::encryptString($value);
       }

       public function getCardCvvEncryptedAttribute($value)
       {
           return Crypt::decryptString($value);
       }
   }