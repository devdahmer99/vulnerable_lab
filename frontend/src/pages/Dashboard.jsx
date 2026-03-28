import React from 'react'

export default function Dashboard(){
  const [stats, setStats] = React.useState(null)
  React.useEffect(()=>{
    fetch('/api/v1/dashboard').then(r=>r.json()).then(setStats).catch(()=>setStats({error:true}))
  },[])
  return (
    <div>
      <h2>Dashboard</h2>
      {stats ? <pre>{JSON.stringify(stats,null,2)}</pre> : <div>Loading...</div>}
    </div>
  )
}
