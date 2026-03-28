<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;

class VulnerableController extends Controller
{
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
