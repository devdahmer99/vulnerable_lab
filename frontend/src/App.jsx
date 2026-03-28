import React from 'react'
import Search from './Search'
import Feedback from './Feedback'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'

export default function App(){
  const [page, setPage] = React.useState('dashboard')
  return (
    <div style={{padding:20}}>
      <h1>Vulnerable Lab - React Frontend</h1>
      <nav style={{marginBottom:10}}>
        <button onClick={()=>setPage('dashboard')}>Dashboard</button>
        <button onClick={()=>setPage('users')}>Users</button>
        <button onClick={()=>setPage('search')}>Search</button>
        <button onClick={()=>setPage('feedback')}>Feedback</button>
      </nav>
      {page === 'dashboard' && <Dashboard />}
      {page === 'users' && <Users />}
      {page === 'search' && <Search />}
      {page === 'feedback' && <Feedback />}
    </div>
  )
}
import React from 'react'
import Search from './Search'
import Feedback from './Feedback'
import Dashboard from './pages/Dashboard'
import Users from './pages/Users'

export default function App(){
  const [page, setPage] = React.useState('dashboard')
  return (
    <div style={{padding:20}}>
      <h1>Vulnerable Lab - React Frontend</h1>
      <nav style={{marginBottom:10}}>
        <button onClick={()=>setPage('dashboard')}>Dashboard</button>
        <button onClick={()=>setPage('users')}>Users</button>
        <button onClick={()=>setPage('search')}>Search</button>
        <button onClick={()=>setPage('feedback')}>Feedback</button>
      </nav>
      {page === 'dashboard' && <Dashboard />}
      {page === 'users' && <Users />}
      {page === 'search' && <Search />}
      {page === 'feedback' && <Feedback />}
    </div>
  )
}
