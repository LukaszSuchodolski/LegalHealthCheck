
import React from 'react'
import { Link, Outlet } from 'react-router-dom'

export default function App() {
  return (
    <div style={{ fontFamily: 'Inter, system-ui, Arial', padding: 24 }}>
      <header style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
        <h1 style={{ margin: 0 }}>LegalHealth Check</h1>
        <nav style={{ display: 'flex', gap: 12 }}>
          <Link to="/">Dashboard</Link>
          <Link to="/checkup">Check-up</Link>
          <Link to="/documents">Dokumenty</Link>
          <Link to="/alerts">Alerty</Link>
        </nav>
      </header>
      <main style={{ marginTop: 24 }}>
        <Outlet />
      </main>
      <footer style={{ marginTop: 48, fontSize: 12, color: '#666' }}>© {new Date().getFullYear()} LegalHealth</footer>
    </div>
  )
}
