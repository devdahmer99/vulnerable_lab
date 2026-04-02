<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VulnerableController extends Controller
{
    // Dashboard endpoint - VULNERABLE: No proper aggregation
    public function dashboard(Request $request)
    {
        // SQL Injection: vulnerable query
        $sql = "SELECT 
                    COUNT(*) as total_orders,
                    SUM(total) as total_revenue,
                    COUNT(CASE WHEN status='pending' THEN 1 END) as pending_orders,
                    COUNT(DISTINCT customer_id) as customers
                FROM orders";
        
        $result = DB::selectOne($sql);
        return response()->json($result);
    }

    // Orders endpoint - VULNERABLE: SQL Injection in search
    public function orders(Request $request)
    {
        $limit = $request->input('limit', 10);
        // Using raw query - VULNERABLE but common mistake
        $orders = DB::select("SELECT * FROM orders ORDER BY created_at DESC LIMIT " . intval($limit));
        return response()->json($orders);
    }

    // Search orders - VULNERABLE: SQL Injection
    public function searchOrders(Request $request)
    {
        $q = $request->input('q', '');
        // VULNERABLE: Direct concatenation without prepared statements
        $sql = "SELECT id, customer_name, customer_email, status, total, created_at FROM orders 
                WHERE id LIKE '%" . $q . "%' 
                OR customer_name LIKE '%" . $q . "%' 
                OR customer_email LIKE '%" . $q . "%'
                LIMIT 50";
        
        $results = DB::select($sql);
        return response()->json($results);
    }

    // Get order details - VULNERABLE: IDOR (Insecure Direct Object Reference)
    public function getOrder($id)
    {
        // No authorization check - any user can access any order
        $order = DB::selectOne("SELECT * FROM orders WHERE id = ?", [$id]);
        
        if (!$order) {
            return response()->json(['error' => 'Order not found'], 404);
        }

        // Get order items with XSS vulnerability in notes
        $items = DB::select("SELECT * FROM order_items WHERE order_id = ?", [$id]);
        $order->items = $items;
        
        // This will return HTML-escaped notes, but stored XSS is possible
        return response()->json($order);
    }

    // Update order status - VULNERABLE: No CSRF token validation in this demo
    public function updateOrderStatus(Request $request, $id)
    {
        $status = $request->input('status', 'pending');
        // VULNERABLE: No proper input validation or authorization
        $allowed = ['pending', 'processing', 'shipped', 'completed'];
        
        if (!in_array($status, $allowed)) {
            return response()->json(['error' => 'Invalid status'], 400);
        }

        DB::update("UPDATE orders SET status = ? WHERE id = ?", [$status, $id]);
        return response()->json(['success' => true]);
    }

    // Customers endpoint - VULNERABLE: SQL Injection in search
    public function customers(Request $request)
    {
        $customers = DB::select("SELECT id, name, email, phone, city, 
                                        COUNT(DISTINCT order_id) as order_count,
                                        COALESCE(SUM(total), 0) as total_spent
                               FROM customers 
                               LEFT JOIN orders ON customers.id = orders.customer_id
                               GROUP BY customers.id
                               LIMIT 100");
        return response()->json($customers);
    }

    // Search customers - VULNERABLE: SQL Injection
    public function searchCustomers(Request $request)
    {
        $q = $request->input('q', '');
        // VULNERABLE: Direct string concatenation
        $sql = "SELECT id, name, email, phone, city FROM customers 
                WHERE name LIKE '%" . $q . "%' 
                OR email LIKE '%" . $q . "%'
                OR phone LIKE '%" . $q . "%'
                LIMIT 100";
        
        $results = DB::select($sql);
        return response()->json($results);
    }

    // Products endpoint
    public function products(Request $request)
    {
        $products = DB::select("SELECT * FROM products LIMIT 100");
        return response()->json($products);
    }

    // Add order note - VULNERABLE: Stored XSS
    public function addOrderNote(Request $request, $id)
    {
        $note = $request->input('note', '');
        
        // VULNERABLE: Stored XSS - storing user input without sanitization
        DB::update("UPDATE orders SET notes = ? WHERE id = ?", [$note, $id]);
        
        return response()->json(['success' => true]);
    }

    // Legacy endpoints for compatibility

    // SQL Injection example: uses raw concatenation
    public function search(Request $request)
    {
        $q = $request->input('q', '');
        $sql = "SELECT id, name, email FROM users WHERE name LIKE '%" . $q . "%' LIMIT 50";
        $results = DB::select($sql);
        return response()->json($results);
    }

    // Reflected XSS: returns unsanitized input inside HTML
    public function feedbackPage(Request $request)
    {
        $msg = $request->input('msg', 'Welcome');
        return "<html><body><h1>Feedback</h1><div>" . $msg . "</div></body></html>";
    }

    // Insecure file upload: saves without validation
    public function upload(Request $request)
    {
        $file = $request->file('file');
        if ($file) {
            $path = $file->storeAs('uploads', $file->getClientOriginalName());
            return response()->json(['path' => $path]);
        }
        return response()->json(['error' => 'no file'], 400);
    }

    // Insecure auth check: simulates weak password handling
    public function login(Request $request)
    {
        $email = $request->input('email');
        $pass = $request->input('password');
        $user = DB::select("SELECT id, email, password FROM users WHERE email = '".$email."' LIMIT 1");
        if ($user && $user[0]->password === $pass) {
            return response()->json(['token' => 'insecure-token-'.$user[0]->id]);
        }
        return response()->json(['error' => 'invalid'], 401);
    }
}

