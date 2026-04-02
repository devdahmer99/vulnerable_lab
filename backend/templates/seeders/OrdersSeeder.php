<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class OrdersSeeder extends Seeder
{
    public function run()
    {
        $customers = DB::table('customers')->get();
        $products = DB::table('products')->get();

        $statuses = ['pending', 'processing', 'shipped', 'completed'];

        // Create sample orders
        for ($i = 1; $i <= 15; $i++) {
            $customer = $customers->random();
            $total = 0;
            $items = [];

            // Add 1-3 items to each order
            $itemCount = rand(1, 3);
            for ($j = 0; $j < $itemCount; $j++) {
                $product = $products->random();
                $quantity = rand(1, 3);
                $itemPrice = $product->price * $quantity;
                $total += $itemPrice;

                $items[] = [
                    'product_id' => $product->id,
                    'product_name' => $product->name,
                    'quantity' => $quantity,
                    'price' => $itemPrice,
                ];
            }

            // Create order
            $order = DB::table('orders')->insertGetId([
                'customer_id' => $customer->id,
                'customer_name' => $customer->name,
                'customer_email' => $customer->email,
                'total' => $total,
                'status' => $statuses[array_rand($statuses)],
                'notes' => 'Pedido de teste #' . $i,
                'created_at' => now()->subDays(rand(0, 30)),
                'updated_at' => now()->subDays(rand(0, 30)),
            ]);

            // Add order items
            foreach ($items as $item) {
                DB::table('order_items')->insert([
                    'order_id' => $order,
                    'product_id' => $item['product_id'],
                    'product_name' => $item['product_name'],
                    'quantity' => $item['quantity'],
                    'price' => $item['price'],
                    'created_at' => now(),
                    'updated_at' => now(),
                ]);
            }
        }
    }
}
