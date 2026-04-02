<?php

use Illuminate\Support\Facades\Route;
use App\Http\Controllers\Api\VulnerableController;
use App\Http\Controllers\Api\UsersController;

use App\Http\Controllers\Api\AuthController;

// Auth endpoints - VULNERABLE
Route::post('v1/login', [AuthController::class, 'login']);
Route::post('v1/logout', [AuthController::class, 'logout']);
Route::post('v1/verify-token', [AuthController::class, 'verifyToken']);
Route::get('v1/me', [AuthController::class, 'getCurrentUser']);

// Dashboard endpoint
Route::get('v1/dashboard', [VulnerableController::class, 'dashboard']);
Route::get('v1/reports', [VulnerableController::class, 'reports']);

// Orders endpoints - VULNERABLE
Route::get('v1/orders', [VulnerableController::class, 'orders']);
Route::get('v1/orders/search', [VulnerableController::class, 'searchOrders']);
Route::get('v1/orders/{id}', [VulnerableController::class, 'getOrder']);
Route::post('v1/orders', [VulnerableController::class, 'createOrder']);
Route::put('v1/orders/{id}', [VulnerableController::class, 'updateOrder']);
Route::delete('v1/orders/{id}', [VulnerableController::class, 'deleteOrder']);
Route::post('v1/orders/{id}/status', [VulnerableController::class, 'updateOrderStatus']);
Route::post('v1/orders/{id}/notes', [VulnerableController::class, 'addOrderNote']);

// Customers endpoints - VULNERABLE
Route::get('v1/customers', [VulnerableController::class, 'customers']);
Route::get('v1/customers/search', [VulnerableController::class, 'searchCustomers']);
Route::post('v1/customers', [VulnerableController::class, 'createCustomer']);
Route::put('v1/customers/{id}', [VulnerableController::class, 'updateCustomer']);
Route::delete('v1/customers/{id}', [VulnerableController::class, 'deleteCustomer']);

// Products endpoints
Route::get('v1/products', [VulnerableController::class, 'products']);
Route::post('v1/products', [VulnerableController::class, 'createProduct']);
Route::put('v1/products/{id}', [VulnerableController::class, 'updateProduct']);
Route::delete('v1/products/{id}', [VulnerableController::class, 'deleteProduct']);

// Legacy endpoints for testing
Route::get('v1/search', [VulnerableController::class, 'search']);
Route::get('v1/feedback', [VulnerableController::class, 'feedbackPage']);
Route::post('v1/upload', [VulnerableController::class, 'upload']);

// Users & roles (vulnerable examples)
Route::get('v1/users', [UsersController::class, 'index']);
Route::get('v1/users/{id}', [UsersController::class, 'show']);
Route::post('v1/users/{id}/role', [UsersController::class, 'setRole']);
