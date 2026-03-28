import React from 'react'

export default function Search() {
  const [q, setQ] = React.useState('')
  const [res, setRes] = React.useState([])
  const doSearch = async () => {
    const r = await fetch(`/api/v1/search?q=${encodeURIComponent(q)}`)
    const j = await r.json()
    setRes(j)
  }
  return (
    <div>
      <h2>Search (SQLi)</h2>
      <input value={q} onChange={e=>setQ(e.target.value)} />
      <button onClick={doSearch}>Search</button>
      <pre>{JSON.stringify(res, null, 2)}</pre>
    </div>
  )
}
