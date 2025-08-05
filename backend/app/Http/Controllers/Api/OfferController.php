<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Offer;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Auth;

class OfferController extends Controller
{
    public function index(Request $request)
{
    $user = Auth::guard('sanctum')->user();
    if (!$user) {
        return response()->json(['error' => 'Non authentifié'], 401);
    }

    // Mettre à jour les offres expirées
    Offer::where('user_id', $user->id)
        ->where('status', '!=', 'completed')
        ->where('status', '!=', 'expired')
        ->whereDate('deadline', '<', now())
        ->update(['status' => 'expired']);

    $query = Offer::where('user_id', $user->id);

    if ($request->has('search')) {
        $query->where('name', 'like', '%' . $request->input('search') . '%');
    }

    if ($request->has('status') && $request->input('status') !== 'all') {
        $query->where('status', $request->input('status'));
    }

    $sort = $request->input('sort', 'created_at');
    $validSorts = ['created_at', 'deadline', 'name'];
    $sort = in_array($sort, $validSorts) ? $sort : 'created_at';

    $offers = $query->orderBy($sort, 'desc')->get()->map(function ($offer) {
        return [
            'id' => $offer->id,
            'name' => $offer->name,
            'budget' => $offer->budget,
            'views' => $offer->views,
            'shares' => $offer->shares,
            'interactions' => $offer->interactions,
            'deadline'=> \Carbon\Carbon::parse($offer->deadline)->toDateString(),
            'status' => $offer->status
        ];
    });

    \Log::info('Offres récupérées pour user_id ' . $user->id . ': ', $offers->toArray());
    return response()->json(['offers' => $offers]);
}


    public function store(Request $request)
    {
        try {
            $user = Auth::guard('sanctum')->user();
            if (!$user) {
                return response()->json(['error' => 'Non authentifié'], 401);
            }

            $validated = $request->validate([
                'name' => 'required|string|max:255',
                'budget' => 'required|numeric|min:0',
                'deadline' => 'required|date|after_or_equal:today',
                'status' => 'required|in:pending,active',
                'views' => 'required|integer|min:0',
                'interactions' => 'required|integer|min:0',
                'shares' => 'sometimes|integer|min:0'
            ]);

            $offer = Offer::create([
                'user_id' => $user->id,
                'name' => $validated['name'],
                'budget' => $validated['budget'],
                'deadline' => $validated['deadline'],
                'status' => $validated['status'],
                'views' => $validated['views'],
                'shares' => $validated['shares'] ?? 0, // Par défaut à 0 si non fourni
                'interactions' => $validated['interactions']
            ]);

            return response()->json(['message' => 'Offre créée avec succès', 'offer' => $offer], 201);
        } catch (\Illuminate\Database\QueryException $e) {
            \Log::error('Erreur de base de données : ' . $e->getMessage());
            return response()->json(['error' => 'Erreur de base de données : ' . $e->getMessage()], 500);
        } catch (\ValidationException $e) {
            return response()->json(['error' => 'Validation échouée : ' . $e->getMessage()], 422);
        } catch (\Exception $e) {
            \Log::info('Erreur inattendue : ' . $e->getMessage());
            return response()->json(['error' => 'Erreur inattendue : ' . $e->getMessage()], 500);
        }
    }

    public function update(Request $request, $id)
{
    try {
        $user = Auth::guard('sanctum')->user();
        if (!$user) {
            return response()->json(['error' => 'Non authentifié'], 401);
        }

        $offer = Offer::where('user_id', $user->id)->findOrFail($id);

        $validated = $request->validate([
            'name' => 'sometimes|required|string|max:255',
            'budget' => 'sometimes|required|numeric|min:0',
            'deadline' => 'sometimes|required|date|after_or_equal:today',
            'status' => 'sometimes|required|in:pending,active,completed',
            'views' => 'sometimes|required|integer|min:0',
            'interactions' => 'sometimes|required|integer|min:0',
            'shares' => 'sometimes|integer|min:0'
        ]);

        $offer->update($validated);

        return response()->json([
            'message' => 'Offre mise à jour avec succès',
            'offer' => $offer
        ], 200);
    } catch (\Illuminate\Database\Eloquent\ModelNotFoundException $e) {
        return response()->json(['error' => 'Offre non trouvée'], 404);
    } catch (\Illuminate\Validation\ValidationException $e) {
        return response()->json(['error' => 'Validation échouée : ' . $e->getMessage()], 422);
    } catch (\Exception $e) {
        \Log::error('Erreur inattendue : ' . $e->getMessage());
        return response()->json(['error' => 'Erreur inattendue : ' . $e->getMessage()], 500);
    }
}

    }

