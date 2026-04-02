import React from 'react'

export default function Login({ onLogin }) {
  const [email, setEmail] = React.useState('')
  const [password, setPassword] = React.useState('')
  const [error, setError] = React.useState('')
  const [loading, setLoading] = React.useState(false)

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError('')
    setLoading(true)

    try {
      const response = await fetch('http://localhost:8000/api/v1/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      })

      const data = await response.json()

      if (!response.ok) {
        setError(data.message || 'Falha no login')
        setLoading(false)
        return
      }

      // Sucesso - chamar onLogin com dados do usuário e token
      onLogin(data.user, data.token)
    } catch (err) {
      setError('Erro ao conectar com o servidor')
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const fillCredentials = (email, password) => {
    setEmail(email)
    setPassword(password)
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-950 via-slate-900 to-cyan-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo/Header */}
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-slate-100 mb-2">OrderHub</h1>
          <p className="text-slate-400">Sistema de Gerenciamento de Pedidos</p>
        </div>

        {/* Login Form */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl shadow-2xl p-8">
          <h2 className="text-2xl font-bold text-slate-100 mb-6">Login</h2>

          {error && (
            <div className="mb-4 p-4 bg-rose-500/15 border border-rose-500/30 text-rose-300 rounded">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Email
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="seu@email.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-slate-300 mb-1">
                Senha
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="w-full px-4 py-2 bg-slate-950 border border-slate-700 text-slate-100 rounded-lg focus:ring-2 focus:ring-cyan-500 focus:border-transparent"
                placeholder="Sua senha"
                required
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full px-4 py-2 bg-cyan-600 text-white rounded-lg hover:bg-cyan-500 disabled:bg-slate-700 font-medium transition"
            >
              {loading ? 'Autenticando...' : 'Login'}
            </button>
          </form>

          {/* Demo Credentials */}
          <div className="mt-6 pt-6 border-t border-slate-800">
            <p className="text-sm text-slate-400 mb-3 font-medium">Credenciais de Teste:</p>
            <div className="space-y-2">
              <button
                onClick={() => fillCredentials('alice@example.com', 'admin123')}
                className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-200 transition"
              >
                👤 Alice (Admin) - alice@example.com
              </button>
              <button
                onClick={() => fillCredentials('bob@example.com', 'password')}
                className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-200 transition"
              >
                👤 Bob (User) - bob@example.com
              </button>
              <button
                onClick={() => fillCredentials('carol@example.com', '123456')}
                className="w-full text-left px-3 py-2 bg-slate-800 hover:bg-slate-700 rounded text-sm text-slate-200 transition"
              >
                👤 Carol (User) - carol@example.com
              </button>
            </div>
          </div>

          {/* Info Box */}
          <div className="mt-6 p-4 bg-amber-500/10 border border-amber-500/20 rounded">
            <p className="text-xs text-amber-300">
              <span className="font-bold">ℹ️ Para Fins Educacionais:</span> Esta é uma aplicação com vulnerabilidades intencionais. Explore e encontre as falhas de segurança!
            </p>
          </div>
        </div>
      </div>
    </div>
  )
}
