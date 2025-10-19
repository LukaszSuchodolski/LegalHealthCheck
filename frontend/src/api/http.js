import axios from "axios";

const RAW_BASE = import.meta.env?.VITE_API_BASE ?? "/api";
const BASE = RAW_BASE.endsWith("/") ? RAW_BASE.slice(0, -1) : RAW_BASE;

const isAbsoluteUrl = (u) =>
  /^[a-z][a-z0-9+.-]*:\/\//i.test(u) || u.startsWith("//");

function joinUrl(base, path) {
  if (!path) return base || "";
  if (isAbsoluteUrl(path)) return path;

  const b = base?.endsWith("/") ? base.slice(0, -1) : base || "";

  if (path.startsWith("/")) {
    if (b && (path === b || path.startsWith(b + "/"))) return path;
    return b ? b + path : path;
  }
  return b ? `${b}/${path}` : path;
}

const http = axios.create();

http.interceptors.request.use((config) => {
  const original = config.url ?? "";
  if (isAbsoluteUrl(original)) return config;
  config.url = joinUrl(BASE, original);
  return config;
});

export default http;
export { joinUrl, BASE };
