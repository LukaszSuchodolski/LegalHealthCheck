// frontend/src/api/http.js
import axios from "axios";

// 1) Źródło prawdy dla BASE
const RAW_BASE = import.meta.env?.VITE_API_BASE ?? "/api";
const BASE = RAW_BASE.endsWith("/") ? RAW_BASE.slice(0, -1) : RAW_BASE;

// 2) Pomocnik: czy absolutny URL (http:, https:, //cdn)
const isAbsoluteUrl = (u) =>
  /^[a-z][a-z0-9+.-]*:\/\//i.test(u) || u.startsWith("//");

// 3) Sklejanie URL bez dublowania BASE
function joinUrl(base, path) {
  if (!path) return base || "";
  if (isAbsoluteUrl(path)) return path;

  const b = base?.endsWith("/") ? base.slice(0, -1) : base || "";

  if (path.startsWith("/")) {
    // ✅ omiń tylko wtedy, gdy path JUŻ zaczyna się od BASE
    if (b && (path === b || path.startsWith(b + "/"))) return path;
    return b ? b + path : path;
  }
  // względny path
  return b ? `${b}/${path}` : path;
}

// 4) Instancja axios
const http = axios.create({
  // Nie ustawiamy tu baseURL na sztywno, bo i tak normalizujemy w interceptorze.
  // Możesz opcjonalnie dać: baseURL: BASE
});

// 5) Interceptor: normalizuje każdą prośbę
http.interceptors.request.use((config) => {
  const original = config.url ?? "";

  // Zostaw absolutne URL-e
  if (isAbsoluteUrl(original)) return config;

  // Wstaw znormalizowaną ścieżkę
  config.url = joinUrl(BASE, original);
  return config;
});

export default http;
export { joinUrl, BASE };
