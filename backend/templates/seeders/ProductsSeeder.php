<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class ProductsSeeder extends Seeder
{
    public function run()
    {
        $products = [
            [
                'name' => 'Notebook Dell Inspiron 15',
                'description' => 'Notebook Dell Inspiron 15 com 8GB RAM e SSD 256GB',
                'price' => 3500.00,
                'stock' => 25,
                'sku' => 'DELL-INS-15-001'
            ],
            [
                'name' => 'Mouse Logitech MX Master 3',
                'description' => 'Mouse sem fio com tecnologia Bluetooth',
                'price' => 450.00,
                'stock' => 120,
                'sku' => 'LOG-MX-MASTER-3'
            ],
            [
                'name' => 'Teclado Mecânico Corsair K95',
                'description' => 'Teclado mecânico RGB com switches Cherry MX',
                'price' => 850.00,
                'stock' => 45,
                'sku' => 'COR-K95-RGB'
            ],
            [
                'name' => 'Monitor LG 24" IPS',
                'description' => 'Monitor 24 polegadas IPS Full HD',
                'price' => 1200.00,
                'stock' => 15,
                'sku' => 'LG-24-IPS-FHD'
            ],
            [
                'name' => 'Webcam Logitech C920',
                'description' => 'Webcam Full HD com microfone integrado',
                'price' => 350.00,
                'stock' => 60,
                'sku' => 'LOG-C920'
            ],
            [
                'name' => 'Headset Corsair Void RGB',
                'description' => 'Headset gamer 7.1 com som surround',
                'price' => 600.00,
                'stock' => 80,
                'sku' => 'COR-VOID-RGB'
            ],
            [
                'name' => 'SSD Kingston NV2 1TB',
                'description' => 'SSD M.2 NVMe 1TB de alta velocidade',
                'price' => 450.00,
                'stock' => 40,
                'sku' => 'KING-NV2-1TB'
            ],
            [
                'name' => 'Memória RAM Corsair Vengeance 16GB',
                'description' => 'Memória DDR4 3200MHz 16GB',
                'price' => 350.00,
                'stock' => 50,
                'sku' => 'COR-VEN-16GB'
            ],
        ];

        DB::table('products')->insert($products);
    }
}
