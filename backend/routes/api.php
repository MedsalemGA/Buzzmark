<?php
use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\AuthController;
use App\Http\Controllers\Api\OfferController;
use App\Http\Controllers\Api\StatsController;
use App\Http\Controllers\Api\UserController;
use App\Http\Controllers\MessagingController;
use App\Http\Controllers\ConversationController;
Route::post('/pre-register', [AuthController::class, 'preRegister']);
Route::post('/process-payment', [AuthController::class, 'processPayment']);
Route::post('/verify-email', [AuthController::class, 'verifyEmail']);
Route::post('/login', [AuthController::class, 'login']);
Route::post('/skip', [AuthController::class, 'skip']);
Route::get('/companies', function () {
    return Company::select('id', 'company_name', 'logo', 'description')->get();
});
;

Route::get('/stats', [StatsController::class, 'getCounts']);
// Routes protégées par Sanctum
Route::middleware('auth:sanctum')->group(function () {
    Route::post('/profile-setup', [AuthController::class, 'profileSetup']);
   
    
    Route::get('/refresh-token', [AuthController::class, 'refreshToken']);
    Route::get('/offers', [OfferController::class, 'index']);
    Route::post('/offers', [OfferController::class, 'store']);
    Route::put('/offers/{id}', [OfferController::class, 'update']);
    Route::get('/user', [UserController::class, 'getUser']);
    Route::put('/user/update', [UserController::class, 'updateUser']);
    Route::delete('/user/delete', [UserController::class, 'deleteUser']);
    Route::put('/user/update-subscription', [UserController::class, 'updateSubscription']);
    Route::get('/company-info', [AuthController::class, 'getInfo']);

});
Route::post('/resend-verification', [AuthController::class, 'resendVerification']);

Route::middleware('auth:sanctum')->group(function () {
    Route::get('/conversations', [ConversationController::class, 'index']);
    Route::post('/conversations', [ConversationController::class, 'store']);
    Route::get('/conversations/{id}', [ConversationController::class, 'show']);

    Route::post('/conversations/{conversationId}/messages', [MessagingController::class, 'store']);
    Route::delete('/conversations/{conversationId}/messages/{messageId}', [MessagingController::class, 'destroy']);
    Route::post('/conversations/{conversationId}/messages/{messageId}/forward', [MessagingController::class, 'forward']);
    Route::post('/conversations/{conversationId}/messages/{messageId}/read', [MessagingController::class, 'markAsRead']);
    Route::post('/conversations/{conversationId}/typing', [MessagingController::class, 'sendTyping']);

    Route::get('/users/search', [UserController::class, 'search']);
});