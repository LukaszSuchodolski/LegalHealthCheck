import { useEffect, useState } from "react";
import { listResults, latestResult } from "@api/results";

export default function Results() {
  const [items, setItems] = useState([]);
  const [latest, setLatest] = useState(null);
  const [error, setError] = useState("");

  useEffect(() => {
    (async () => {
      try {
        const [list, last] = await Promise.all([
          listResults(),
          latestResult().catch(() => null),
        ]);
        setItems(list || []);
        setLatest(last);
      } catch (e) {
        setError("Nie udało się pobrać wyników.");
      }
    })();
  }, []);

  return (
    <div style={{ padding: 16 }}>
      <h2>Moje wyniki</h2>

      {error && (
        <div style={{ color: "crimson", marginBottom: 8 }}>{error}</div>
      )}

      <section style={{ marginBottom: 24 }}>
        <h3>Ostatni wynik</h3>
        {!latest ? (
          <div>Brak wyniku.</div>
        ) : (
          <pre
            style={{
              background: "#f5f5f5",
              padding: 12,
              borderRadius: 6,
              overflowX: "auto",
            }}
          >
            {JSON.stringify(latest, null, 2)}
          </pre>
        )}
      </section>

      <section>
        <h3>Historia plików</h3>
        {items.length === 0 ? (
          <div>Brak zapisanych wyników.</div>
        ) : (
          <table style={{ width: "100%", borderCollapse: "collapse" }}>
            <thead>
              <tr>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "6px 4px",
                  }}
                >
                  Plik
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "6px 4px",
                  }}
                >
                  Rozmiar
                </th>
                <th
                  style={{
                    textAlign: "left",
                    borderBottom: "1px solid #ddd",
                    padding: "6px 4px",
                  }}
                >
                  Modyfikacja
                </th>
              </tr>
            </thead>
            <tbody>
              {items.map((it) => (
                <tr key={it.filename}>
                  <td
                    style={{
                      padding: "6px 4px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {it.filename}
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {it.size} B
                  </td>
                  <td
                    style={{
                      padding: "6px 4px",
                      borderBottom: "1px solid #eee",
                    }}
                  >
                    {it.modified}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
