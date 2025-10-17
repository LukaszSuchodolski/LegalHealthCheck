// src/pages/Alerts.jsx
import { useEffect, useState } from "react";
import http from "@api/http";
import Loader from "../components/Loader";

export default function Alerts() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [alerts, setAlerts] = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await http.get("/api/v1/alerts/");
        setAlerts(Array.isArray(res.data) ? res.data : []);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Błąd ładowania alertów");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Ładowanie alertów..." />;
  if (error)
    return <div style={{ color: "crimson", padding: 24 }}>{error}</div>;

  return (
    <div className="max-w-4xl mx-auto space-y-4">
      <h2 className="text-2xl font-semibold text-slate-900">
        Alerty regulacyjne
      </h2>
      {alerts.length === 0 ? (
        <p className="text-slate-600">Brak alertów.</p>
      ) : (
        <ul className="space-y-3">
          {alerts.map((a) => (
            <li
              key={a.id}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm"
            >
              <div className="flex items-start justify-between gap-3">
                <div>
                  <strong className="block text-slate-900">{a.title}</strong>
                  <p className="text-slate-700 mt-1">{a.message}</p>
                </div>
                <span
                  className={`text-xs px-2 py-1 rounded-full ${
                    a.severity === "critical"
                      ? "bg-red-100 text-red-800"
                      : a.severity === "warning"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-slate-100 text-slate-700"
                  }`}
                >
                  {a.severity}
                </span>
              </div>
              <div className="text-xs text-slate-500 mt-2">
                Utworzono:{" "}
                {a.created_at ? new Date(a.created_at).toLocaleString() : "—"}
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
