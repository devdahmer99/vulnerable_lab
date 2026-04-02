<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class CustomersSeeder extends Seeder
{
    public function run()
    {
        $customers = [
            [
                'name' => 'João Silva',
                'email' => 'joao.silva@example.com',
                'phone' => '11987654321',
                'city' => 'São Paulo',
                'address' => 'Rua A, 123'
            ],
            [
                'name' => 'Maria Santos',
                'email' => 'maria.santos@example.com',
                'phone' => '11987654322',
                'city' => 'Rio de Janeiro',
                'address' => 'Avenida B, 456'
            ],
            [
                'name' => 'Carlos Oliveira',
                'email' => 'carlos@example.com',
                'phone' => '11987654323',
                'city' => 'Belo Horizonte',
                'address' => 'Rua C, 789'
            ],
            [
                'name' => 'Ana Costa',
                'email' => 'ana@example.com',
                'phone' => '11987654324',
                'city' => 'Brasília',
                'address' => 'Quadra D, 101'
            ],
            [
                'name' => 'Tech Solutions Ltda',
                'email' => 'contato@techsolutions.com',
                'phone' => '1133334444',
                'city' => 'São Paulo',
                'address' => 'Av. Paulista, 1000'
            ],
        ];

        DB::table('customers')->insert($customers);
    }
}
