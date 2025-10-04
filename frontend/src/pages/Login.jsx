import React, { useState } from "react";
import { loginApi } from "../api/auth";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Login() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [remember, setRemember] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/dashboard";

  async function handleLogin(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      const data = await loginApi(username, password);
      login(data.access_token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Nieprawidłowe dane logowania");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Zaloguj się
        </h1>

        <form onSubmit={handleLogin} className="space-y-4">
          {/* Nazwa użytkownika / e-mail */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              E-mail lub nazwa użytkownika
            </label>
            <input
              id="username"
              type="text"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 outline-none transition"
            />
          </div>

          {/* Hasło */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Hasło
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 outline-none transition"
            />
          </div>

          {/* Zapamiętaj mnie + Zresetuj */}
          <div className="flex items-center justify-between text-sm text-gray-600">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={remember}
                onChange={(e) => setRemember(e.target.checked)}
                className="rounded border-gray-300 focus:ring-blue-500"
              />
              Zapamiętaj mnie
            </label>
            <button
              type="button"
              className="text-blue-600 hover:underline"
              onClick={() => alert("Reset hasła w przygotowaniu")}
            >
              Zresetuj hasło
            </button>
          </div>

          {/* Błąd */}
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          {/* Przycisk */}
          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition disabled:opacity-50"
          >
            {loading ? "Logowanie..." : "Zaloguj się"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Nie masz konta?{" "}
          <Link
            to="/register"
            state={{ from: location.state?.from }}
            className="text-blue-600 hover:underline"
          >
            Zarejestruj się
          </Link>
        </p>
      </div>
    </div>
  );
}
