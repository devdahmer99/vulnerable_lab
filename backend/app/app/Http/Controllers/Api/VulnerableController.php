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

    // Reports endpoint - VULNERABLE: raw SQL with concatenated filters
    public function reports(Request $request)
    {
        $type = $request->input('type', 'sales');
        $range = $request->input('range', '30');

        // VULNERABLE: direct string concatenation for date interval
        $sinceExpr = "datetime('now', '-".$range." days')";

        $metricsSql = "SELECT
                        COUNT(*) as total_orders,
                        COALESCE(SUM(total), 0) as total_revenue,
                        COALESCE(AVG(total), 0) as avg_ticket,
                        COUNT(CASE WHEN status='pending' THEN 1 END) as pending_orders,
                        COUNT(DISTINCT customer_id) as total_customers
                    FROM orders
                    WHERE created_at >= ".$sinceExpr;

        $metrics = DB::selectOne($metricsSql);

        $dailySalesSql = "SELECT
                            date(created_at) as day,
                            COUNT(*) as orders,
                            COALESCE(SUM(total), 0) as revenue
                          FROM orders
                          WHERE created_at >= ".$sinceExpr."
                          GROUP BY date(created_at)
                          ORDER BY day ASC";

        $dailySales = DB::select($dailySalesSql);

        $topProductsSql = "SELECT
                            oi.product_name as name,
                            COALESCE(SUM(oi.quantity), 0) as sales,
                            COALESCE(SUM(oi.price), 0) as revenue
                          FROM order_items oi
                          INNER JOIN orders o ON o.id = oi.order_id
                          WHERE o.created_at >= ".$sinceExpr."
                          GROUP BY oi.product_name
                          ORDER BY sales DESC
                          LIMIT 10";

        $topProducts = DB::select($topProductsSql);

        $topCustomersSql = "SELECT
                            o.customer_name as name,
                            COUNT(*) as orders,
                            COALESCE(SUM(o.total), 0) as spent
                          FROM orders o
                          WHERE o.created_at >= ".$sinceExpr."
                          GROUP BY o.customer_name
                          ORDER BY spent DESC
                          LIMIT 10";

        $topCustomers = DB::select($topCustomersSql);

        // VULNERABLE: SQL injection in order by input
        $sort = $request->input('sort', 'created_at DESC');
        $recentOrdersSql = "SELECT id, customer_name, total, status, created_at
                            FROM orders
                            WHERE created_at >= ".$sinceExpr."
                            ORDER BY ".$sort."
                            LIMIT 20";
        $recentOrders = DB::select($recentOrdersSql);

        return response()->json([
            'type' => $type,
            'range' => $range,
            'metrics' => $metrics,
            'daily_sales' => $dailySales,
            'top_products' => $topProducts,
            'top_customers' => $topCustomers,
            'recent_orders' => $recentOrders,
        ]);
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

    // Create order - VULNERABLE: raw SQL, no auth, no robust validation
    public function createOrder(Request $request)
    {
        $customerName = $request->input('customer_name', 'Sem Nome');
        $customerEmail = $request->input('customer_email', 'sem-email@example.com');
        $customerId = $request->input('customer_id', 1);
        $total = $request->input('total', 0);
        $status = $request->input('status', 'pending');
        $notes = $request->input('notes', '');

        $sql = "INSERT INTO orders (customer_id, customer_name, customer_email, total, status, notes, created_at, updated_at)
                VALUES ('".$customerId."', '".$customerName."', '".$customerEmail."', '".$total."', '".$status."', '".$notes."', datetime('now'), datetime('now'))";

        DB::statement($sql);
        $id = DB::getPdo()->lastInsertId();

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // Update order - VULNERABLE: mass assignment style update via raw SQL
    public function updateOrder(Request $request, $id)
    {
        $customerName = $request->input('customer_name', 'Sem Nome');
        $customerEmail = $request->input('customer_email', 'sem-email@example.com');
        $total = $request->input('total', 0);
        $status = $request->input('status', 'pending');
        $notes = $request->input('notes', '');

        $sql = "UPDATE orders SET
                    customer_name = '".$customerName."',
                    customer_email = '".$customerEmail."',
                    total = '".$total."',
                    status = '".$status."',
                    notes = '".$notes."',
                    updated_at = datetime('now')
                WHERE id = '".$id."'";

        DB::statement($sql);

        return response()->json(['success' => true]);
    }

    // Delete order - VULNERABLE: IDOR + no ownership checks
    public function deleteOrder($id)
    {
        DB::statement("DELETE FROM order_items WHERE order_id = '".$id."'");
        DB::statement("DELETE FROM orders WHERE id = '".$id."'");
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

    // Create customer - VULNERABLE: no validation / raw SQL
    public function createCustomer(Request $request)
    {
        $name = $request->input('name', 'Novo Cliente');
        $email = $request->input('email', 'novo@example.com');
        $phone = $request->input('phone', '');
        $city = $request->input('city', '');
        $address = $request->input('address', '');

        $sql = "INSERT INTO customers (name, email, phone, city, address, created_at, updated_at)
                VALUES ('".$name."', '".$email."', '".$phone."', '".$city."', '".$address."', datetime('now'), datetime('now'))";

        DB::statement($sql);
        $id = DB::getPdo()->lastInsertId();

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // Update customer - VULNERABLE: no field restrictions
    public function updateCustomer(Request $request, $id)
    {
        $name = $request->input('name', 'Novo Cliente');
        $email = $request->input('email', 'novo@example.com');
        $phone = $request->input('phone', '');
        $city = $request->input('city', '');
        $address = $request->input('address', '');

        $sql = "UPDATE customers SET
                    name = '".$name."',
                    email = '".$email."',
                    phone = '".$phone."',
                    city = '".$city."',
                    address = '".$address."',
                    updated_at = datetime('now')
                WHERE id = '".$id."'";

        DB::statement($sql);
        return response()->json(['success' => true]);
    }

    // Delete customer - VULNERABLE: no dependency checks
    public function deleteCustomer($id)
    {
        DB::statement("DELETE FROM customers WHERE id = '".$id."'");
        return response()->json(['success' => true]);
    }

    // Products endpoint
    public function products(Request $request)
    {
        $products = DB::select("SELECT * FROM products LIMIT 100");
        return response()->json($products);
    }

    // Create product - VULNERABLE: raw SQL and weak validation
    public function createProduct(Request $request)
    {
        $name = $request->input('name', 'Novo Produto');
        $description = $request->input('description', '');
        $price = $request->input('price', 0);
        $stock = $request->input('stock', 0);
        $sku = $request->input('sku', 'SKU-'.time());

        $sql = "INSERT INTO products (name, description, price, stock, sku, created_at, updated_at)
                VALUES ('".$name."', '".$description."', '".$price."', '".$stock."', '".$sku."', datetime('now'), datetime('now'))";

        DB::statement($sql);
        $id = DB::getPdo()->lastInsertId();

        return response()->json(['success' => true, 'id' => $id], 201);
    }

    // Update product - VULNERABLE: direct string interpolation
    public function updateProduct(Request $request, $id)
    {
        $name = $request->input('name', 'Novo Produto');
        $description = $request->input('description', '');
        $price = $request->input('price', 0);
        $stock = $request->input('stock', 0);
        $sku = $request->input('sku', 'SKU-'.time());

        $sql = "UPDATE products SET
                    name = '".$name."',
                    description = '".$description."',
                    price = '".$price."',
                    stock = '".$stock."',
                    sku = '".$sku."',
                    updated_at = datetime('now')
                WHERE id = '".$id."'";

        DB::statement($sql);
        return response()->json(['success' => true]);
    }

    // Delete product - VULNERABLE: no protection for linked order items
    public function deleteProduct($id)
    {
        DB::statement("DELETE FROM products WHERE id = '".$id."'");
        return response()->json(['success' => true]);
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

