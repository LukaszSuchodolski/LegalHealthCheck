import React, { useEffect, useState } from "react";
import http from "../api/http";
import Loader from "../components/Loader";

export default function Dashboard() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [score, setScore]     = useState(null);
  const [docs, setDocs]       = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const [healthRes, docsRes] = await Promise.all([
          http.get("/api/v1/audit/health"),
          http.get("/api/v1/documents/"),
        ]);
        setScore(healthRes.data || null);
        setDocs(docsRes.data || []);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Błąd pobierania danych dashboardu");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Ładowanie dashboardu..." />;
  if (error)   return <div style={{ color: "crimson", padding: 24 }}>{error}</div>;

  return (
    <div>
      <h2>Dashboard</h2>

      <section>
        <h3>Twój stan prawny</h3>
        {score ? (
          <div style={{ fontSize: 32 }}>
            {score.score}%{" "}
            <span style={{ fontSize: 16, color: "#666" }}>
              ({score.level})
            </span>
          </div>
        ) : (
          <p>Brak danych o wyniku.</p>
        )}
      </section>

      <section style={{ marginTop: 24 }}>
        <h3>Dokumenty</h3>
        {docs.length > 0 ? (
          <ul>
            {docs.map((d) => (
              <li key={d.id}>
                <strong>{d.title}</strong> — <em>{d.status}</em>
              </li>
            ))}
          </ul>
        ) : (
          <p>Brak dokumentów.</p>
        )}
      </section>
    </div>
  );
}
