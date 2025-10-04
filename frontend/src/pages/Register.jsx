import React, { useState } from "react";
import { registerApi, loginApi } from "../api/auth";
import { useLocation, useNavigate, Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

export default function Register() {
  const [form, setForm] = useState({ username: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);

  const { login } = useAuth();
  const location = useLocation();
  const navigate = useNavigate();
  const from = location.state?.from?.pathname || "/dashboard";

  function update(field) {
    return (e) => setForm((f) => ({ ...f, [field]: e.target.value }));
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setBusy(true);
    try {
      await registerApi(form);
      const { access_token } = await loginApi(form.username, form.password);
      login(access_token);
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message || "Rejestracja nie powiodła się");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="w-full max-w-sm bg-white p-8 rounded-xl shadow-md border border-gray-200">
        <h1 className="text-2xl font-semibold text-center text-gray-800 mb-6">
          Załóż konto
        </h1>

        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Nazwa użytkownika */}
          <div>
            <label
              htmlFor="username"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nazwa użytkownika
            </label>
            <input
              id="username"
              value={form.username}
              onChange={update("username")}
              minLength={3}
              maxLength={50}
              required
              placeholder="np. jan_kowalski"
              className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 outline-none transition"
            />
          </div>

          {/* E-mail */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              E-mail (opcjonalnie)
            </label>
            <input
              id="email"
              type="email"
              value={form.email}
              onChange={update("email")}
              placeholder="jan@example.com"
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
              value={form.password}
              onChange={update("password")}
              minLength={6}
              maxLength={128}
              required
              placeholder="min. 6 znaków"
              className="w-full rounded-md border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 p-2 outline-none transition"
            />
          </div>

          {/* Błąd */}
          {error && (
            <p className="text-red-600 text-sm text-center">{error}</p>
          )}

          {/* Przycisk */}
          <button
            type="submit"
            disabled={busy}
            className="w-full py-2 bg-blue-500 text-white font-semibold rounded-md hover:bg-blue-600 transition disabled:opacity-50"
          >
            {busy ? "Zakładam konto..." : "Zarejestruj się"}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-4">
          Masz już konto?{" "}
          <Link
            to="/login"
            state={{ from: location.state?.from }}
            className="text-blue-600 hover:underline"
          >
            Zaloguj się
          </Link>
        </p>

        <p className="text-xs text-gray-500 text-center mt-3">
          Po rejestracji zalogujemy Cię automatycznie.
        </p>
      </div>
    </div>
  );
}
