import React from 'react'

export default function Feedback() {
  const [msg, setMsg] = React.useState('')
  const open = () => {
    window.open(`/api/v1/feedback?msg=${encodeURIComponent(msg)}`)
  }
  return (
    <div>
      <h2>Feedback (Reflected XSS)</h2>
      <input value={msg} onChange={e=>setMsg(e.target.value)} />
      <button onClick={open}>Open Feedback</button>
    </div>
  )
}
