import React, { useEffect, useState } from "react";
import http from "../api/http";
import Loader from "../components/Loader";

export default function Alerts() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [alerts, setAlerts]   = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await http.get("/api/v1/alerts/");
        setAlerts(res.data || []);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Błąd ładowania alertów");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Ładowanie alertów..." />;
  if (error)   return <div style={{ color: "crimson", padding: 24 }}>{error}</div>;

  return (
    <div>
      <h2>Alerty regulacyjne</h2>
      {alerts.length === 0 ? (
        <p>Brak alertów.</p>
      ) : (
        <ul>
          {alerts.map((a) => (
            <li key={a.id} style={{ marginBottom: 12 }}>
              <strong>{a.title}</strong>
              <br />
              <small>
                od: {a.effective_from ? new Date(a.effective_from).toLocaleDateString() : "—"}
              </small>
              <br />
              <span>{a.summary}</span>
              {Array.isArray(a.actions) && a.actions.length > 0 && (
                <ul>
                  {a.actions.map((act, i) => (
                    <li key={i}>{act}</li>
                  ))}
                </ul>
              )}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
