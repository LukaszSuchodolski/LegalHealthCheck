
import React, { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Dashboard() {
  const [score, setScore] = useState(null)
  const [docs, setDocs] = useState([])

  useEffect(() => {
    api('/v1/audit/health').then(setScore).catch(console.error)
    api('/v1/documents/').then(setDocs).catch(console.error)
  }, [])

  return (
    <div>
      <h2>Dashboard</h2>
      <section>
        <h3>Twój stan prawny</h3>
        {score ? (
          <div style={{ fontSize: 32 }}>
            {score.score}% <span style={{ fontSize: 16, color: '#666' }}>({score.level})</span>
          </div>
        ) : 'Ładowanie...'}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Dokumenty</h3>
        <ul>
          {docs.map(d => (
            <li key={d.id}>
              <strong>{d.title}</strong> — <em>{d.status}</em>
            </li>
          ))}
        </ul>
      </section>
    </div>
  )
}
