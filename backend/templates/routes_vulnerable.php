<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\VulnerableController;

// vulnerable routes
Route::get('v1/search', [VulnerableController::class, 'search']);
Route::get('v1/feedback', [VulnerableController::class, 'feedbackPage']);
Route::post('v1/upload', [VulnerableController::class, 'upload']);
Route::post('v1/login', [VulnerableController::class, 'login']);

// Users & roles (vulnerable examples)
Route::get('v1/users', [\App\Http\Controllers\Api\UsersController::class, 'index']);
Route::get('v1/users/{id}', [\App\Http\Controllers\Api\UsersController::class, 'show']);
Route::post('v1/users/{id}/role', [\App\Http\Controllers\Api\UsersController::class, 'setRole']);
Route::get('v1/dashboard', [\App\Http\Controllers\Api\UsersController::class, 'dashboard']);
