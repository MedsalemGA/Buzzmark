<?php namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use App\Models\User;

class StatsController extends Controller
{
    public function getCounts()
    {
        $influencerCount = User::where('client_type', 'influenceur')->count();
        $companyCount = User::where('client_type', 'entreprise')->count();

        return response()->json([
            'influencers' => $influencerCount,
            'companies' => $companyCount
        ]);
    }
}
