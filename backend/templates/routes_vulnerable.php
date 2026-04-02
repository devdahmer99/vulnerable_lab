<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VulnerableController;

// Dashboard endpoint
Route::get('v1/dashboard', [VulnerableController::class, 'dashboard']);

// Orders endpoints - VULNERABLE
Route::get('v1/orders', [VulnerableController::class, 'orders']);
Route::get('v1/orders/search', [VulnerableController::class, 'searchOrders']);
Route::get('v1/orders/{id}', [VulnerableController::class, 'getOrder']);
Route::post('v1/orders/{id}/status', [VulnerableController::class, 'updateOrderStatus']);
Route::post('v1/orders/{id}/notes', [VulnerableController::class, 'addOrderNote']);

// Customers endpoints - VULNERABLE
Route::get('v1/customers', [VulnerableController::class, 'customers']);
Route::get('v1/customers/search', [VulnerableController::class, 'searchCustomers']);

// Products endpoints
Route::get('v1/products', [VulnerableController::class, 'products']);

// Legacy endpoints for testing
Route::get('v1/search', [VulnerableController::class, 'search']);
Route::get('v1/feedback', [VulnerableController::class, 'feedbackPage']);
Route::post('v1/upload', [VulnerableController::class, 'upload']);
Route::post('v1/login', [VulnerableController::class, 'login']);

// Users & roles (vulnerable examples)
Route::get('v1/users', [\App\Http\Controllers\Api\UsersController::class, 'index']);
Route::get('v1/users/{id}', [\App\Http\Controllers\Api\UsersController::class, 'show']);
Route::post('v1/users/{id}/role', [\App\Http\Controllers\Api\UsersController::class, 'setRole']);

