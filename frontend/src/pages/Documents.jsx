import { useEffect, useState } from "react";
import { http } from "../api/http";

export default function Documents() {
  const [templates, setTemplates] = useState([]);
  const [uploads, setUploads] = useState([]);
  const [busy, setBusy] = useState(false);
  const [msg, setMsg] = useState("");

  async function loadAll() {
    setMsg("Ładowanie...");
    try {
      const [t, u] = await Promise.all([
        http("/api/v1/documents/templates"),
        http("/api/v1/documents/uploads"),
      ]);
      setTemplates(t || []);
      setUploads(u || []);
      setMsg("");
    } catch (e) {
      setMsg("Błąd ładowania");
    }
  }

  useEffect(() => {
    loadAll();
  }, []);

  async function onUpload(ev) {
    const file = ev.target.files?.[0];
    if (!file) return;
    setBusy(true);
    setMsg("Wysyłanie...");
    try {
      const fd = new FormData();
      fd.append("file", file, file.name);
      await http("/api/v1/documents/upload", { method: "POST", body: fd });
      await loadAll();
      setMsg("OK – wysłano");
    } catch {
      setMsg("Błąd uploadu");
    } finally {
      setBusy(false);
      ev.target.value = "";
    }
  }

  function downloadTemplate(id) {
    window.open(
      `${import.meta.env.VITE_API_BASE}/api/v1/documents/templates/download/${id}`,
      "_blank",
    );
  }

  function downloadUpload(name) {
    window.open(
      `${import.meta.env.VITE_API_BASE}/api/v1/documents/download/${name}`,
      "_blank",
    );
  }

  async function removeUpload(name) {
    if (!confirm(`Usunąć ${name}?`)) return;
    setBusy(true);
    try {
      await http(`/api/v1/documents/delete/${encodeURIComponent(name)}`, {
        method: "DELETE",
      });
      await loadAll();
    } catch {
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
                  <button
                    onClick={() => downloadUpload(u.filename)}
                    style={{ cursor: "pointer" }}
                  >
                    Pobierz
                  </button>
                  <button
                    onClick={() => removeUpload(u.filename)}
                    style={{ cursor: "pointer" }}
                  >
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
