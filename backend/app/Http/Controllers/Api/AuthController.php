<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\User;
use App\Models\EmailVerification;
use App\Models\Payment;
use App\Models\Company;
use App\Models\Influencer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Hash;
use Illuminate\Support\Facades\Mail;
use Illuminate\Support\Str;
use Illuminate\Support\Facades\DB;
use Carbon\Carbon;

class AuthController extends Controller
{
 

    public function preRegister(Request $request)
    {
        $validated = $request->validate([
            'client_type' => 'required|in:entreprise,influenceur',
            'email' => 'required|email|unique:users,email',
            'password' => 'required|min:8',
            'company_name' => 'required_if:client_type,entreprise',
            'full_name' => 'required_if:client_type,influenceur',
            'tiktok_url' => 'required_if:client_type,influenceur| nullable|url',
            'instagram_url' => ' required_if:client_type,influenceur|nullable|url',
            'youtube_url' => ' required_if:client_type,influenceur|nullable|url'

            
        ]);

        $code = Str::random(6);
        try {
            EmailVerification::create([
                'email' => $validated['email'],
                'code' => $code,
                'expires_at' => now()->addHours(1),
                'register_data' => json_encode($validated) // Assurer que c'est une chaîne JSON
            ]);

            Mail::raw("Votre code de vérification est : $code", function ($message) use ($validated) {
                $message->to($validated['email'])->subject('Code de vérification Buzzmark');
            });

            return response()->json(['message' => 'Pré-inscription réussie, veuillez choisir un abonnement']);
        } catch (\Exception $e) {
            \Log::error('Erreur envoi email: ' . $e->getMessage());
            return response()->json([
                'message' => 'Pré-inscription enregistrée, mais l\'envoi de l\'email a échoué. Veuillez vérifier votre boîte de réception.',
                'code' => $code // Pour débogage, à supprimer en production
            ], 200);
        }
    }

    public function processPayment(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'client_type' => 'required|in:entreprise,influenceur',
            'plan' => 'required|in:Basic,Premium,VIP',
            'card_number' => 'required|string',
            'card_expiry' => 'required|string',
            'card_cvv' => 'required|string',
            'duration' => 'required|in:1month,6months,1year'

        ]);

        $verification =  EmailVerification::where('email', $validated['email'])->first();
        $user = User::where('email', $validated['email'])->first();
        if (!$verification && !$user) {
            \Log::error('Pré-inscription non trouvée pour email: ' . $validated['email']);
            return response()->json(['message' => 'Pré-inscription non trouvée'], 404);
        }

        // Enregistrer le paiement
        try {
            Payment::create([
                'email' => $validated['email'],
                'client_type' => $validated['client_type'],
                'plan' => $validated['plan'],
                'card_number_encrypted' => $validated['card_number'],
                'card_expiry' => $validated['card_expiry'],
                'card_cvv_encrypted' => $validated['card_cvv'],
                'status' => 'completed' // Simulé
            ]);

            // Stocker le plan dans register_data
            if($verification instanceof EmailVerification){
                $registerData = is_string($verification->register_data) 
                ? json_decode($verification->register_data, true) 
                : $verification->register_data;
                $registerData['subscription_plan'] = $validated['plan'];
                $registerData['duration'] = $validated['duration'];
                $verification->update(['register_data' => json_encode($registerData)]);
                \Log::info('Paiement simulé et enregistré pour: ', $validated);

                return response()->json([
                    'message' => 'Paiement simulé avec succès',
                    'redirect_url' => 'http://localhost:4200/verify-email?email=' . urlencode($validated['email'])
            ]);
            }
          

          
            else{
                $duration = $request->input('duration'); // '1month', '6months', '1year'
                $now = Carbon::now();

                $expirationDate = match ($duration) {
              '1month' => $now->copy()->addMonth(),
                        '6months' => $now->copy()->addMonths(6),
                        '1year' => $now->copy()->addYear(),
                        default => $now->copy()->addMonth(), // fallback
                    };
                    
                
                $user->update([
                    'subscription_plan' => $validated['plan'],
                    'subscription_expires_at' => $expirationDate
                ]);
                return response()->json([
                'message' => 'Paiement simulé avec succès',
                'redirect_url' => 'http://localhost:4200/dashboard/entreprise?email=' . urlencode($validated['email'])
            ]);
            }
        } catch (\Exception $e) {
            \Log::error('Erreur lors de l\'enregistrement du paiement: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors du traitement du paiement: ' . $e->getMessage()], 500);
        }
        

    }

 public function skip(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'phone_number' => 'nullable|string',
            'address' => 'nullable|string',
            'logo' => 'nullable|string',
            'secteur' => 'nullable|string',
            'numero_commercial' => 'nullable|string',
            'photo_de_profil' => 'nullable|string',
            'date_de_naissance' => 'nullable|string',
        ]);

        // Retrieve EmailVerification record
        $verification = EmailVerification::where('email', $validated['email'])->first();
        if (!$verification) {
            \Log::error('EmailVerification not found for email: ' . $validated['email']);
            return response()->json(['message' => 'Pré-inscription non trouvée'], 404);
        }

        // Decode existing register_data
        $registerData = is_string($verification->register_data)
            ? json_decode($verification->register_data, true)
            : ($verification->register_data ?? []);

        // Merge new data from the request
        $registerData = array_merge($registerData, array_filter([
            'phone_number' => $validated['phone_number'] ?? null,
            'address' => $validated['address'] ?? null,
            'logo' => $validated['logo'] ?? null,
            'industry' => $validated['secteur'] ?? null,
            'numero_commercial' => $validated['numero_commercial'] ?? null,
            'photo_de_profil' => $validated['photo_de_profil'] ?? null,
            'date_de_naissance' => $validated['date_de_naissance'] ?? null,
        ], fn($value) => !is_null($value)));

        // Update EmailVerification with the new register_data
        try {
            $verification->update(['register_data' => json_encode($registerData)]);
            \Log::info('Updated EmailVerification with skip data for email: ' . $validated['email']);
            return response()->json(['message' => 'Informations enregistrées avec succès']);
        } catch (\Exception $e) {
            \Log::error('Error updating EmailVerification: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de l\'enregistrement des informations'], 500);
        }
    }

    public function verifyEmail(Request $request)
    {
        $validated = $request->validate([
            'email' => 'required|email',
            'code' => 'required'
        ]);

        $verification = EmailVerification::where('email', $validated['email'])
            ->where('code', $validated['code'])
            ->where('expires_at', '>', now())
            ->first();

        if (!$verification) {
            \Log::error('Invalid or expired code for email: ' . $validated['email']);
            return response()->json(['message' => 'Code incorrect ou expiré'], 400);
        }

        $registerData = is_string($verification->register_data)
            ? json_decode($verification->register_data, true)
            : ($verification->register_data ?? []);

        // Determine expiration date
        $duration = $registerData['duration'] ?? '1month';
        $now = Carbon::now();
        $expirationDate = match ($duration) {
            '1month' => $now->copy()->addMonth(),
            '6months' => $now->copy()->addMonths(6),
            '1year' => $now->copy()->addYear(),
            default => $now->copy()->addMonth(),
        };

        try {
            $user = DB::transaction(function () use ($validated, $registerData, $expirationDate) {
                // Create User
                $user = User::create([
                    'email' => $validated['email'],
                    'password' => Hash::make($registerData['password']),
                    'client_type' => $registerData['client_type'] ?? 'entreprise',
                    'company_name' => $registerData['company_name'] ?? null,
                    'subscription_plan' => $registerData['subscription_plan'] ?? 'classique',
                    'subscription_expires_at' => $expirationDate,
                    'email_verified' => true,
                    'full_name' => $registerData['full_name'] ?? null
                ]);

                // Create Company or Influencer
                if ($registerData['client_type'] === 'entreprise') {
                    Company::create([
                        'user_id' => $user->id,
                        'company_name' => $registerData['company_name'] ?? 'Default Company',
                        'industry' => $registerData['industry'] ?? null,
                        'phone_number' => $registerData['phone_number'] ?? null,
                        'address' => $registerData['address'] ?? null,
                        'logo' => $registerData['logo'] ?? null,
                        'description' => $registerData['description'] ?? null,
                        'numero_commercial' => $registerData['numero_commercial'] ?? null
                    ]);
                } elseif ($registerData['client_type'] === 'influenceur') {
                    Influencer::create([
                        'user_id' => $user->id,
                        'full_name' => $registerData['full_name'] ?? 'Default Influencer',
                        'phone_number' => $registerData['phone_number'] ?? null,
                        'address' => $registerData['address'] ?? null,
                        'photo_de_profil' => $registerData['photo_de_profil'] ?? null,
                        'date_de_naissance' => $registerData['date_de_naissance'] ?? null,
                        'tiktok_url' => $registerData['tiktok_url'] ?? null,
                        'instagram_url' => $registerData['instagram_url'] ?? null,
                        'youtube_url' => $registerData['youtube_url'] ?? null
                    ]);
                }

                return $user;
            });

            // Delete EmailVerification after successful processing
            $verification->delete();
            \Log::info('User and profile created for email: ' . $validated['email']);

            $token = $user->createToken('auth_token')->plainTextToken;

            return response()->json([
                'message' => 'Email vérifié',
                'client_type' => $user->client_type,
                'token' => $token
            ], 200);
        } catch (\Exception $e) {
            \Log::error('Error in verifyEmail: ' . $e->getMessage());
            return response()->json(['message' => 'Erreur lors de la vérification de l\'email'], 500);
        }
    }

    public function resendVerification(Request $request)
{
    $request->validate([
        'email' => 'required|email|exists:email_verifications,email',
    ]);

    $user = EmailVerification::where('email', $request->email)->first();

    if ($user->email_verified) {
        return response()->json([
            'message' => 'This email is already verified.'
        ], 400);
    }

    // Générer un nouveau code ou en réutiliser un
    $verification = EmailVerification::updateOrCreate(
        ['email' => $request->email,
        'code' => Str::random(6),
        'expires_at' => now()->addHours(1),
        'register_data' => $user->register_data]

    );

    // Envoyer l'email (exemple simple)
    Mail::raw("Your verification code is: {$verification->code}", function ($message) use ($user) {
        $message->to($user->email)
                ->subject('Verification Code');
    });

    return response()->json([
        'message' => 'Verification code resent successfully.'
    ]);
}


  
    // ... autres méthodes (login, profileSetup, user) ...


         public function login(Request $request)
         {
             $validated = $request->validate([
                 'usernameOrEmail' => 'required',
                 'password' => 'required',
                 'client_type' => 'required|in:entreprise,influenceur'
             ]);

             $user = User::where('email', $validated['usernameOrEmail'])
                 ->orWhere('company_name', $validated['usernameOrEmail'])
                 ->where('client_type', $validated['client_type'])
                 ->first();

             if (!$user || !Hash::check($validated['password'], $user->password)) {
                 return response()->json(['message' => 'Identifiants incorrects'], 401);
             }

             if (!$user->email_verified) {
                 return response()->json(['message' => 'Veuillez vérifier votre email'], 403);
             }

             $token = $user->createToken('auth_token')->plainTextToken;
             return response()->json(['token' => $token, 'user' => $user]);
                   if ($user->subscription_expires_at && $user->subscription_expires_at->isPast()) {
    return response()->json([
        'message' => 'Subscription expired',
        'expired' => true
    ], 403);
}
         }
     

   

    

 

 

       public function logout(Request $request)
       {
           $request->user()->currentAccessToken()->delete();
           return response()->json(['message' => 'Déconnexion réussie']);
       }

       public function profileSetup(Request $request)
       {
           $user = auth()->user();

           if (!$user) {
               return response()->json(['message' => 'Non authentifié'], 401);
           }

           $validated = $request->validate([
               'client_type' => 'required|in:entreprise,influenceur',
               'logo_url' => 'nullable|url',
               'commercial_number' => 'required_if:client_type,entreprise',
               'address' => 'nullable|string',
               'description' => 'nullable|string',
               'full_name' => 'required_if:client_type,influenceur',
               'biography' => 'nullable|string',
               'tiktok_url' => 'nullable|url',
               'instagram_url' => 'nullable|url',
               'youtube_url' => 'nullable|url'
           ]);

           $user->profile()->updateOrCreate(
               ['user_id' => $user->id],
               $validated
           );

           return response()->json(['message' => 'Profil mis à jour']);
       }
       public function handleWebhook(Request $request)
{
    $payload = $request->getContent();
    $sig_header = $request->header('Stripe-Signature');
    $endpoint_secret = env('STRIPE_WEBHOOK_SECRET');

    try {
        $event = \Stripe\Webhook::constructEvent($payload, $sig_header, $endpoint_secret);
        if ($event->type === 'checkout.session.completed') {
            $session = $event->data->object;
            // Logique pour marquer le paiement comme réussi
            \Log::info('Paiement réussi pour session: ' . $session->id);
        }
        return response()->json(['status' => 'success']);
    } catch (\Exception $e) {
        \Log::error('Erreur webhook: ' . $e->getMessage());
        return response()->json(['error' => $e->getMessage()], 400);
    }
}
   public function getInfo(Request $req)
{
    $id = $req->user()->id;
    $company = Company::where('user_id', $id)->first();
    

if (!$company) {
    return response()->json(['message' => 'Aucune société trouvée pour cet utilisateur'], 404);
}
    return response()->json([
        'company_name' => $company->company_name
    ]);
}
}