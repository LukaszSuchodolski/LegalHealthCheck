
import React, { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Alerts() {
  const [alerts, setAlerts] = useState([])
  useEffect(() => {
    api('/v1/alerts/').then(setAlerts).catch(console.error)
  }, [])

  return (
    <div>
      <h2>Alerty regulacyjne</h2>
      <ul>
        {alerts.map(a => (
          <li key={a.id} style={{ marginBottom: 12 }}>
            <strong>{a.title}</strong><br/>
            <small>od: {new Date(a.effective_from).toLocaleDateString()}</small><br/>
            <span>{a.summary}</span>
            <ul>
              {a.actions.map((act, i) => <li key={i}>{act}</li>)}
            </ul>
          </li>
        ))}
      </ul>
    </div>
  )
}
