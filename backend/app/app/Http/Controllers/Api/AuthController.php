<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class AuthController extends Controller
{
    // Login endpoint - VULNERABLE: SQL Injection + Weak password check
    public function login(Request $request)
    {
        $email = $request->input('email', '');
        $password = $request->input('password', '');

        // VULNERABLE: SQL Injection - Direct string concatenation
        $sql = "SELECT id, name, email, password, role FROM users WHERE email = '" . $email . "' LIMIT 1";

        try {
            $user = DB::selectOne($sql);
        } catch (\Exception $e) {
            return response()->json(['message' => 'Database error'], 500);
        }

        // Check if user exists
        if (!$user) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // VULNERABLE: Plain text password comparison (passwords stored in plain text)
        // In a real system, use bcrypt or similar
        if ($user->password !== $password) {
            return response()->json(['message' => 'Invalid credentials'], 401);
        }

        // VULNERABLE: Weak token generation (predictable, no expiry, no secret validation)
        $token = $this->generateWeakToken($user->id);

        // Return user data and token
        return response()->json([
            'user' => [
                'id' => $user->id,
                'name' => $user->name,
                'email' => $user->email,
                'role' => $user->role,
            ],
            'token' => $token,
            'message' => 'Login successful'
        ]);
    }

    // Generate weak JWT-like token (VULNERABLE)
    private function generateWeakToken($userId)
    {
        // VULNERABLE: Simple token format without proper signing
        // Just BASE64 encoding without HMAC or signature
        $payload = [
            'user_id' => $userId,
            'iat' => time(),
            // NO EXPIRY - token valid forever!
            'data' => 'insecure-token'
        ];

        // VULNERABLE: Using base64 without any signature
        $token = base64_encode(json_encode($payload));

        return $token;
    }

    // Verify token - VULNERABLE: No real verification
    public function verifyToken(Request $request)
    {
        $token = $request->input('token', '');

        // VULNERABLE: Minimal validation
        if (empty($token)) {
            return response()->json(['valid' => false]);
        }

        try {
            // Just decode without validating signature or expiry
            $decoded = json_decode(base64_decode($token), true);

            if (!isset($decoded['user_id'])) {
                return response()->json(['valid' => false]);
            }

            // Get user from database - VULNERABLE: No caching, every request queries DB
            $user = DB::selectOne("SELECT id, name, email, role FROM users WHERE id = ?", [$decoded['user_id']]);

            if (!$user) {
                return response()->json(['valid' => false]);
            }

            return response()->json([
                'valid' => true,
                'user' => $user
            ]);
        } catch (\Exception $e) {
            return response()->json(['valid' => false]);
        }
    }

    // Logout (VULNERABLE: Does nothing server-side, relies on client to delete token)
    public function logout(Request $request)
    {
        // VULNERABLE: No token blacklisting or invalidation
        // Token remains valid on server side forever
        return response()->json(['message' => 'Logged out (client-side only)']);
    }

    // Get current user - VULNERABLE: Trusts token without proper validation
    public function getCurrentUser(Request $request)
    {
        $authHeader = $request->header('Authorization');

        if (!$authHeader) {
            return response()->json(['error' => 'No token provided'], 401);
        }

        // Extract token from "Bearer <token>"
        $token = str_replace('Bearer ', '', $authHeader);

        try {
            $decoded = json_decode(base64_decode($token), true);

            if (!isset($decoded['user_id'])) {
                return response()->json(['error' => 'Invalid token'], 401);
            }

            $user = DB::selectOne("SELECT id, name, email, role FROM users WHERE id = ?", [$decoded['user_id']]);

            if (!$user) {
                return response()->json(['error' => 'User not found'], 404);
            }

            return response()->json($user);
        } catch (\Exception $e) {
            return response()->json(['error' => 'Invalid token'], 401);
        }
    }
}
