import React from 'react'
import Search from './Search'
import Feedback from './Feedback'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'

export default function App(){
  const [page, setPage] = React.useState('dashboard')
  return (
    <div className="min-h-screen">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Vulnerable Lab</h1>
          <nav className="space-x-2">
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={()=>setPage('dashboard')}>Dashboard</button>
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={()=>setPage('users')}>Users</button>
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={()=>setPage('search')}>Search</button>
            <button className="px-3 py-1 bg-gray-200 rounded" onClick={()=>setPage('feedback')}>Feedback</button>
          </nav>
        </div>
      </header>
      <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
        <div className="px-4 py-6 sm:px-0">
          {page === 'dashboard' && <Dashboard />}
          {page === 'users' && <Users />}
          {page === 'search' && <Search />}
          {page === 'feedback' && <Feedback />}
        </div>
      </main>
    </div>
  )
}
