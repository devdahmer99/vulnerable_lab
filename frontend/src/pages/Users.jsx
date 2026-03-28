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
      <h2>Users</h2>
      <div style={{display:'flex',gap:20}}>
        <div style={{flex:1}}>
          <ul>
            {users.map(u=> <li key={u.id}><button onClick={()=>view(u.id)}>{u.name} &lt;{u.email}&gt;</button></li>)}
          </ul>
        </div>
        <div style={{flex:1}}>
          {selected ? (
            <div>
              <h3>{selected.name}</h3>
              <p>{selected.email}</p>
              <label>Set role: <input value={role} onChange={e=>setRole(e.target.value)} /></label>
              <button onClick={()=>setRoleApi(selected.id)}>Apply</button>
            </div>
          ) : <div>Select a user</div>}
        </div>
      </div>
    </div>
  )
}
