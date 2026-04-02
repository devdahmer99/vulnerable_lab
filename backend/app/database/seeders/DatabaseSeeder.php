<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;

class DatabaseSeeder extends Seeder
{
    public function run()
    {
        $this->call([
            UsersTableSeeder::class,
            CustomersSeeder::class,
            ProductsSeeder::class,
            OrdersSeeder::class,
        ]);
    }
}
