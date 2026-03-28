<?php

namespace Database\Seeders;

use Illuminate\Database\Seeder;
use Illuminate\Support\Facades\DB;

class UsersTableSeeder extends Seeder
{
    public function run()
    {
        // Cria roles
        DB::table('roles')->insert([['name'=>'admin'], ['name'=>'user']]);

        // Usuários vulneráveis com senhas em texto claro (para estudo)
        DB::table('users')->insert([
            ['name'=>'Alice Admin','email'=>'alice@example.com','password'=>'admin123'],
            ['name'=>'Bob User','email'=>'bob@example.com','password'=>'password'],
            ['name'=>'Carol','email'=>'carol@example.com','password'=>'123456']
        ]);

        // vincula roles (admin para Alice)
        $admin = DB::table('users')->where('email','alice@example.com')->first();
        $user = DB::table('users')->where('email','bob@example.com')->first();
        $adminRole = DB::table('roles')->where('name','admin')->first();
        $userRole = DB::table('roles')->where('name','user')->first();

        DB::table('role_user')->insert([
            ['user_id'=>$admin->id,'role_id'=>$adminRole->id],
            ['user_id'=>$user->id,'role_id'=>$userRole->id]
        ]);
    }
}
