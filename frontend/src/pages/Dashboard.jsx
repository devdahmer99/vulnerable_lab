import React from 'react'

export default function Dashboard(){
  const [stats, setStats] = React.useState(null)
  React.useEffect(()=>{
    fetch('/api/v1/dashboard').then(r=>r.json()).then(setStats).catch(()=>setStats({error:true}))
  },[])
  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Dashboard</h2>
      {stats ? (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white shadow rounded p-4">
            <div className="text-sm text-gray-500">Total Users</div>
            <div className="text-3xl font-bold">{stats.total_users ?? '-'}</div>
          </div>
          <div className="bg-white shadow rounded p-4">
            <div className="text-sm text-gray-500">Admin Users</div>
            <div className="text-3xl font-bold">{stats.admin_users ?? '-'}</div>
          </div>
        </div>
      ) : <div>Loading...</div>}
    </div>
  )
}
