
import React, { useEffect, useState } from 'react'
import { api } from '../api/client'

export default function Documents() {
  const [docs, setDocs] = useState([])
  useEffect(() => {
    api('/v1/documents/').then(setDocs).catch(console.error)
  }, [])

  return (
    <div>
      <h2>Dokumenty</h2>
      <table border="1" cellPadding="8" style={{ borderCollapse: 'collapse' }}>
        <thead>
          <tr><th>Tytuł</th><th>Kategoria</th><th>Status</th></tr>
        </thead>
        <tbody>
          {docs.map(d => (
            <tr key={d.id}>
              <td>{d.title}</td>
              <td>{d.category}</td>
              <td>{d.status}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  )
}
