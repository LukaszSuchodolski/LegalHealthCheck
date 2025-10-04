// src/api/http.js
import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000", // dostosuj do backendu
  withCredentials: false,
  timeout: 20000,
});

// REQUEST: dodaj token, jeśli istnieje
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("lhc_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE: jeśli 401 → wyloguj
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem("lhc_token");
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default http;
