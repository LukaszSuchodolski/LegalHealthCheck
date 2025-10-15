const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

function authHeaders() {
  const t = localStorage.getItem("lhc_token");
  return t ? { Authorization: `Bearer ${t}` } : {};
}

export async function http(path, { method = "GET", headers = {}, body } = {}) {
  const res = await fetch(`${API_BASE}${path}`, {
    method,
    headers: { ...headers, ...authHeaders() },
    body,
  });
  // gdy JSON
  const ct = res.headers.get("content-type") || "";
  const maybeJson = ct.includes("application/json");
  if (!res.ok) {
    const errText = maybeJson ? JSON.stringify(await res.json()).slice(0, 200) : await res.text();
    throw new Error(`${res.status} ${res.statusText} ${errText}`);
  }
  return maybeJson ? res.json() : res;
}
