import React, { useEffect, useState } from "react";
import http from "../api/http";
import Loader from "../components/Loader";

export default function Documents() {
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState("");
  const [docs, setDocs]       = useState([]);

  useEffect(() => {
    (async () => {
      try {
        setLoading(true);
        setError("");
        const res = await http.get("/api/v1/documents/");
        setDocs(res.data || []);
      } catch (e) {
        console.error(e);
        setError(e?.message || "Błąd ładowania dokumentów");
      } finally {
        setLoading(false);
      }
    })();
  }, []);

  if (loading) return <Loader label="Ładowanie dokumentów..." />;
  if (error)   return <div style={{ color: "crimson", padding: 24 }}>{error}</div>;

  return (
    <div>
      <h2>Dokumenty</h2>
      {docs.length === 0 ? (
        <p>Brak dokumentów.</p>
      ) : (
        <table border="1" cellPadding="8" style={{ borderCollapse: "collapse" }}>
          <thead>
            <tr>
              <th>Tytuł</th>
              <th>Kategoria</th>
              <th>Status</th>
            </tr>
          </thead>
          <tbody>
            {docs.map((d) => (
              <tr key={d.id}>
                <td>{d.title}</td>
                <td>{d.category}</td>
                <td>{d.status}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
