import { useEffect, useMemo, useState } from "react";
import http from "../api/http";

const FALLBACK_API_BASE = "http://127.0.0.1:8000";

export default function Documents() {
  const [templates, setTemplates] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  const apiBase = useMemo(
    () => http.defaults?.baseURL ?? import.meta.env.VITE_API_BASE ?? FALLBACK_API_BASE,
    []
  );

  async function loadAll() {
    setMsg("Ładowanie...");
    try {
      const [templatesRes, uploadsRes] = await Promise.all([
        http.get("/api/v1/documents/templates"),
        http.get("/api/v1/documents/uploads"),
      ]);
      setTemplates(Array.isArray(templatesRes.data) ? templatesRes.data : []);
      setUploads(Array.isArray(uploadsRes.data) ? uploadsRes.data : []);
      setMsg("");
    } catch (e) {
      console.error(e);
      setMsg("Błąd ładowania");
    }
  }

  useEffect(() => {
    void loadAll();
  }, []);

  async function onUpload(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg("Wysyłanie...");
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      await http.post("/api/v1/documents/upload", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      await loadAll();
      setMsg("OK – wysłano");
    } catch (e) {
      console.error(e);
      setMsg("Błąd uploadu");
    } finally {
      setBusy(false);
      ev.target.value = "";
    }
  }

  function downloadTemplate(id) {
    window.open(`${apiBase}/api/v1/documents/templates/download/${id}`, "_blank");
  }

  function downloadUpload(name) {
    window.open(`${apiBase}/api/v1/documents/download/${name}`, "_blank");
  }

  async function removeUpload(name) {
    if (!confirm(`Usunąć ${name}?`)) return;
    setBusy(true);
    try {
      await http.delete(`/api/v1/documents/delete/${encodeURIComponent(name)}`);
      await loadAll();
    } catch (e) {
      console.error(e);
      setMsg("Błąd kasowania");
    } finally {
      setBusy(false);
    }
  }

  return (
    <div style={{ padding: 16 }}>
      <h2>📄 Documents</h2>
      {msg && <div style={{ marginBottom: 8 }}>{msg}</div>}

      <section style={{ marginBottom: 24 }}>
        <h3>Szablony do pobrania</h3>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                ID
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                Tytuł
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                Kategoria
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                Status
              </th>
              <th style={{ borderBottom: "1px solid #ddd" }} />
            </tr>
          </thead>
          <tbody>
            {templates.map((t) => (
              <tr key={t.id}>
                <td style={{ padding: 6 }}>{t.id}</td>
                <td style={{ padding: 6 }}>{t.title}</td>
                <td style={{ padding: 6 }}>{t.category}</td>
                <td style={{ padding: 6 }}>{t.status}</td>
                <td style={{ padding: 6 }}>
                  <button
                    onClick={() => downloadTemplate(t.id)}
                    style={{ cursor: "pointer" }}
                  >
                    Pobierz
                  </button>
                </td>
              </tr>
            ))}
            {!templates.length && (
              <tr>
                <td colSpan="5" style={{ padding: 6, color: "#666" }}>
                  Brak danych
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>

      <section style={{ marginBottom: 24 }}>
        <h3>Wyślij dokument</h3>
        <input type="file" onChange={onUpload} disabled={busy} />
      </section>

      <section>
        <h3>Twoje uploady</h3>
        <table style={{ borderCollapse: "collapse", width: "100%" }}>
          <thead>
            <tr>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                Plik
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                Rozmiar
              </th>
              <th style={{ textAlign: "left", borderBottom: "1px solid #ddd" }}>
                Data
              </th>
              <th style={{ borderBottom: "1px solid " }} />
            </tr>
          </thead>
          <tbody>
            {uploads.map((u) => (
              <tr key={u.filename}>
                <td style={{ padding: 6 }}>{u.filename}</td>
                <td style={{ padding: 6 }}>{u.size}</td>
                <td style={{ padding: 6 }}>{u.modified || u.uploaded_at}</td>
                <td style={{ padding: 6, display: "flex", gap: 8 }}>
                  <button onClick={() => downloadUpload(u.filename)} style={{ cursor: "pointer" }}>
                    Pobierz
                  </button>
                  <button onClick={() => removeUpload(u.filename)} style={{ cursor: "pointer" }}>
                    Usuń
                  </button>
                </td>
              </tr>
            ))}
            {!uploads.length && (
              <tr>
                <td colSpan="4" style={{ padding: 6, color: "#666" }}>
                  Brak uploadów
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </section>
    </div>
  );
}
