<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class UsersController extends Controller
{
    // Lista todos os usuários sem paginação ou filtros
    public function index()
    {
        $users = DB::select('SELECT id, name, email, created_at FROM users');
        return response()->json($users);
    }

    // Mostra usuário por id (possível IDOR se usado sem auth)
    public function show($id)
    {
        $u = DB::select("SELECT id, name, email, created_at FROM users WHERE id = $id LIMIT 1");
        if ($u) return response()->json($u[0]);
        return response()->json(['error'=>'not found'], 404);
    }

    // Define role para um usuário (sem verificação de permissão)
    public function setRole(Request $request, $id)
    {
        $role = $request->input('role');
        $r = DB::select("SELECT id FROM roles WHERE name = '".$role."' LIMIT 1");
        if (!$r) return response()->json(['error'=>'role not found'], 400);
        // remove roles anteriores e insere a nova
        DB::delete("DELETE FROM role_user WHERE user_id = $id");
        DB::insert("INSERT INTO role_user (user_id, role_id, created_at, updated_at) VALUES ($id, {$r[0]->id}, now(), now())");
        return response()->json(['ok'=>true]);
    }

    // Dashboard simples: conta usuários e roles
    public function dashboard()
    {
        $total = DB::select('SELECT COUNT(*) as c FROM users')[0]->c;
        $admins = DB::select("SELECT COUNT(*) as c FROM role_user ru JOIN roles r ON ru.role_id=r.id WHERE r.name='admin'")[0]->c;
        return response()->json(['total_users'=>$total,'admin_users'=>$admins]);
    }
}
