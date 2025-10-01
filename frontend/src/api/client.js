
const API_BASE = import.meta?.env?.VITE_API_BASE || 'http://127.0.0.1:8000/api'

export async function api(path, options = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    headers: { 'Content-Type': 'application/json', ...(options.headers || {}) },
    ...options
  })
  if (!res.ok) {
    const txt = await res.text()
    throw new Error(`API ${res.status}: ${txt}`)
  }
  return res.json()
}
