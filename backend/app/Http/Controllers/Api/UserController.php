<?php namespace App\Http\Controllers\Api;
use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;
use App\Models\User;
use App\Models\Company;
use App\Models\Influencer;
use Illuminate\Support\Facades\Hash;

class UserController extends Controller
{
    public function getUser(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $data = ['user' => $user];
        if ($user->client_type === 'entreprise') {
            $company = Company::where('user_id', $user->id)->first();
            $data['company'] = $company;
        } elseif ($user->client_type === 'influencer') {
            $influencer = Influencer::where('user_id', $user->id)->first();
            $data['influencer'] = $influencer;
        }

        return response()->json($data);
  

    }

    public function updateUser(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'email' => 'required|email|unique:users,email,' . $user->id,
            'password' => 'nullable|min:6',

            'phone_number' => 'required|string',
            'address' => 'required|string',
            
            'company_name' => 'required_if:client_type,entreprise|string',
            'industry' => 'nullable|string',
            'numero_commercial' => 'nullable|string',
            'logo' => 'nullable|url',
            'full_name' => 'required_if:client_type,influencer|string',
            'date_de_naissance' => 'nullable|date',
            'tiktok_url' => 'nullable|url',
            'instagram_url' => 'nullable|url',
            'youtube_url' => 'nullable|url',
            'photo_de_profil' => 'nullable|url',
        ]);

        if ($user->client_type === 'entreprise') {
            Company::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'company_name' => $validated['company_name'],
                    'industry' => $validated['industry'] ?? null,
                    'phone_number' => $validated['phone_number'],
                    'address' => $validated['address'],
                    'numero_commercial' => $validated['numero_commercial'],
                    'logo' => $validated['logo'],
                    
                    
                ]
            );
        } elseif ($user->client_type === 'influencer') {
            Influencer::updateOrCreate(
                ['user_id' => $user->id],
                [
                    'full_name' => $validated['full_name'],
                    'phone_number' => $validated['phone_number'],
                    'address' => $validated['address'],
                    'date_de_naissance' => $validated['date_de_naissance'],
                    'tiktok_url' => $validated['tiktok_url'],
                    'instagram_url' => $validated['instagram_url'],
                    'youtube_url' => $validated['youtube_url'],
                    'photo_de_profil' => $validated['photo_de_profil'],
                ]
            );
        }
        

       $updateData = [
    'email' => $validated['email'],
    
];

if (!empty($validated['password'])) {
    $updateData['password'] = Hash::make($validated['password']);
}

$user->update($updateData);

    }

    public function deleteUser(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        if ($user->client_type === 'entreprise') {
            Company::where('user_id', $user->id)->delete();
        } elseif ($user->client_type === 'influencer') {
            Influencer::where('user_id', $user->id)->delete();
        }

        $user->tokens()->delete(); // Remove Sanctum tokens
        $user->delete();

        return response()->json(['message' => 'User deleted successfully']);
    }

    public function updateSubscription(Request $request)
    {
        $user = Auth::user();
        if (!$user) {
            return response()->json(['message' => 'Unauthenticated'], 401);
        }

        $validated = $request->validate([
            'subscription_plan' => 'required|in:Basic,Premium,VIP',
        ]);

        $user->update(['subscription_plan' => $validated['subscription_plan']]);

        return response()->json(['message' => 'Subscription updated successfully']);
    }
     public function search(Request $request)
    {
        $request->validate([
            'query' => 'required|string|min:2',
        ]);

        $user = Auth::user();

        $users = User::where('id', '!=', $user->id)
            ->whereIn('client_type', ['company', 'influencer'])
            ->where(function ($query) use ($request) {
                $query->where('company_name', 'like', '%' . $request->query . '%')
                      ->orWhereHas('influencer', function ($q) use ($request) {
                          $q->where('full_name', 'like', '%' . $request->query . '%');
                      });
            })
            ->with(['company', 'influencer'])
            ->get();

        return response()->json($users->map(function ($user) {
            return [
                'id' => $user->id,
                'name' => $user->name,
                'type' => $user->client_type,
                'imageUrl' => $user->image_url,
                'isOnline' => $user->is_online,
            ];
        }));
    }
}