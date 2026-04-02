import React from 'react'
import Dashboard from './pages/Dashboard'
import Orders from './pages/Orders'
import Customers from './pages/Customers'
import Products from './pages/Products'
import Reports from './pages/Reports'
import Login from './pages/Login'

export default function App(){
  const [page, setPage] = React.useState('dashboard')
  const [user, setUser] = React.useState(null)
  const [token, setToken] = React.useState(localStorage.getItem('auth_token'))

  React.useEffect(() => {
    // Restaurar sessão do localStorage
    const storedToken = localStorage.getItem('auth_token')
    const storedUser = localStorage.getItem('auth_user')
    
    if (storedToken && storedUser) {
      setToken(storedToken)
      setUser(JSON.parse(storedUser))
      setPage('dashboard')
    }
  }, [])

  const handleLogin = (userData, authToken) => {
    setUser(userData)
    setToken(authToken)
    localStorage.setItem('auth_token', authToken)
    localStorage.setItem('auth_user', JSON.stringify(userData))
    setPage('dashboard')
  }

  const handleLogout = () => {
    setUser(null)
    setToken(null)
    localStorage.removeItem('auth_token')
    localStorage.removeItem('auth_user')
    setPage('login')
  }

  // Se não está autenticado, mostrar apenas login
  if (!token || !user) {
    return <Login onLogin={handleLogin} />
  }
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: '📊' },
    { id: 'orders', label: 'Pedidos', icon: '📦' },
    { id: 'customers', label: 'Clientes', icon: '👥' },
    { id: 'products', label: 'Produtos', icon: '🛍️' },
    { id: 'reports', label: 'Relatórios', icon: '📈' },
  ]

  return (
    <div className="flex h-screen bg-slate-950 text-slate-100">
      {/* Sidebar */}
      <aside className="w-64 bg-gradient-to-b from-slate-950 to-slate-900 shadow-2xl border-r border-slate-800">
        <div className="p-6 border-b border-slate-700">
          <h1 className="text-2xl font-bold text-white">OrderHub</h1>
          <p className="text-xs text-slate-400 mt-1">Sistema de Pedidos</p>
        </div>

        <nav className="mt-6 px-4 space-y-2">
          {navItems.map(item => (
            <button
              key={item.id}
              onClick={() => setPage(item.id)}
              className={`w-full text-left px-4 py-3 rounded-lg transition flex items-center gap-3 ${
                page === item.id
                    ? 'bg-cyan-500/20 text-cyan-200 border border-cyan-400/30 font-medium'
                    : 'text-slate-300 hover:bg-slate-800'
              }`}
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.label}</span>
            </button>
          ))}
        </nav>

        <div className="absolute bottom-0 w-64 p-4 border-t border-slate-800 space-y-3">
          <div className="bg-slate-700 rounded-lg p-3">
            <p className="text-xs text-slate-400">Usuário</p>
            <p className="text-sm font-medium text-white">{user?.name || 'Carregando...'}</p>
            <p className="text-xs text-slate-400">{user?.role}</p>
          </div>
          <button
            onClick={handleLogout}
            className="w-full px-4 py-2 bg-rose-700/90 text-white rounded-lg hover:bg-rose-600 text-sm font-medium"
          >
            Logout
          </button>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 overflow-auto">
        {/* Top Bar */}
        <header className="bg-slate-900/90 shadow-sm border-b border-slate-800 backdrop-blur">
          <div className="px-8 py-4 flex items-center justify-between">
            <h2 className="text-2xl font-bold text-slate-100">
              {navItems.find(n => n.id === page)?.label}
            </h2>
            <div className="flex items-center gap-4">
              <button className="p-2 hover:bg-slate-800 rounded-lg">🔔</button>
              <button className="p-2 hover:bg-slate-800 rounded-lg">⚙️</button>
            </div>
          </div>
        </header>

        {/* Page Content */}
        <div className="p-8">
          {page === 'dashboard' && <Dashboard token={token} />}
          {page === 'orders' && <Orders token={token} />}
          {page === 'customers' && <Customers token={token} />}
          {page === 'products' && <Products token={token} />}
          {page === 'reports' && <Reports token={token} />}
        </div>
      </main>
    </div>
  )
}
