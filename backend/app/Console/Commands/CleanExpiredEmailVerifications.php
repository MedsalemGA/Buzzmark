<?php

namespace App\Console\Commands;

use Illuminate\Console\Command;
use App\Models\EmailVerification;
use Carbon\Carbon;

class CleanExpiredEmailVerifications extends Command
{
    protected $signature = 'email-verifications:clean';
    protected $description = 'Supprime les vérifications email expirées depuis plus d\'1 heure';

    public function handle()
    {
        $count = EmailVerification::where('expires_at', '<', Carbon::now())->delete();
        $this->info("$count vérifications expirées supprimées.");
    }
}

