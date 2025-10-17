// frontend/src/api/http.js
const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";

/** Niski poziom: jedno miejsce do fetchy */
export async function request(path, { method = "GET", body, token } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(`${BASE}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error("HTTP error");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** Wysoki poziom: wygodne metody */
const http = {
  get: (path, opts = {}) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts = {}) =>
    request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts = {}) =>
    request(path, { ...opts, method: "PUT", body }),
  delete: (path, opts = {}) => request(path, { ...opts, method: "DELETE" }),
};

export default http; // ⬅️ eksport domyślny
