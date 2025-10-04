import axios from "axios";

const http = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://127.0.0.1:8000", // dostosuj
  withCredentials: false,
  timeout: 20000,
});

// REQUEST: do każdego żądania dodajemy Bearer token z localStorage
http.interceptors.request.use((config) => {
  const token = localStorage.getItem("lhc_token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// RESPONSE: gdy dostaniemy 401, czyścimy token i przenosimy na /login
http.interceptors.response.use(
  (res) => res,
  (err) => {
    const status = err?.response?.status;
    if (status === 401) {
      localStorage.removeItem("lhc_token");
      // prosty hard-redirect (działa nawet poza React Routerem)
      if (window.location.pathname !== "/login") {
        window.location.assign("/login");
      }
    }
    return Promise.reject(err);
  }
);

export default http;
