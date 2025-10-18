import axios from "axios";

const API_BASE = import.meta.env.VITE_API_BASE ?? "http://127.0.0.1:8000";

function safeStorageGet(key) {
  if (typeof window === "undefined") {
    return "";
  }
  try {
    const storage = window.localStorage;
    if (!storage) {
      return "";
    }
    const value = storage.getItem(key);
    return value ?? "";
  } catch (error) {
    console.warn("Unable to read from localStorage", error);
    return "";
  }
}

const http = axios.create({
  baseURL: API_BASE,
  headers: { Accept: "application/json" },
});

http.interceptors.request.use((config) => {
  const token = safeStorageGet("lhc_token");
  if (token) {
    config.headers = { ...(config.headers ?? {}) };
    if (!config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

http.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      const { status, statusText, data } = error.response;
      const serialized =
        data == null
          ? ""
          : typeof data === "string"
          ? data
          : JSON.stringify(data);
      const snippet = serialized ? serialized.slice(0, 200) : "";
      error.message = `${status} ${statusText}${snippet ? ` ${snippet}` : ""}`;
    }
    return Promise.reject(error);
  }
);

export default http;
