import React from 'react'

export default function Users(){
  const [users, setUsers] = React.useState([])
  const [selected, setSelected] = React.useState(null)
  const [role, setRole] = React.useState('user')

  const load = ()=> fetch('/api/v1/users').then(r=>r.json()).then(setUsers)
  React.useEffect(()=>{ load() },[])

  const view = async (id)=>{
    const r = await fetch(`/api/v1/users/${id}`)
    const j = await r.json()
    setSelected(j)
  }

  const setRoleApi = async (id)=>{
    await fetch(`/api/v1/users/${id}/role`, {method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({role})})
    load()
  }

  return (
    <div>
      <h2 className="text-2xl font-semibold mb-4">Users</h2>
      <div className="grid grid-cols-3 gap-6">
        <div className="col-span-2">
          <div className="bg-white shadow rounded">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Name</th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase">Email</th>
                  <th className="px-6 py-3"></th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {users.map(u => (
                  <tr key={u.id}>
                    <td className="px-6 py-4 whitespace-nowrap">{u.name}</td>
                    <td className="px-6 py-4 whitespace-nowrap">{u.email}</td>
                    <td className="px-6 py-4 whitespace-nowrap text-right"><button className="text-blue-600" onClick={()=>view(u.id)}>View</button></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
        <div>
          <div className="bg-white shadow rounded p-4">
            {selected ? (
              <div>
                <h3 className="text-lg font-medium">{selected.name}</h3>
                <p className="text-sm text-gray-600">{selected.email}</p>
                <div className="mt-4">
                  <label className="block text-sm text-gray-700">Set role</label>
                  <input className="mt-1 block w-full border rounded px-2 py-1" value={role} onChange={e=>setRole(e.target.value)} />
                  <button className="mt-3 px-3 py-1 bg-blue-600 text-white rounded" onClick={()=>setRoleApi(selected.id)}>Apply</button>
                </div>
              </div>
            ) : <div className="text-gray-500">Select a user</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
