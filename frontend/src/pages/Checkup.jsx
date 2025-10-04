import React, { useState } from "react";
import http from "../api/http";
import Loader from "../components/Loader";

export default function Checkup() {
  const [answers, setAnswers] = useState({
    has_employees: "no",
    bhp_training: "yes",
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError]           = useState("");
  const [result, setResult]         = useState(null);

  const submit = async () => {
    try {
      setSubmitting(true);
      setError("");

      // KLUCZ: obiekt z tablicą answers
      const payload = {
        answers: Object.entries(answers).map(([question_id, value]) => ({
          question_id,
          value,
        })),
      };

      const { data } = await http.post("/api/v1/audit/checkup", payload);
      setResult(data);
    } catch (e) {
      console.error(e);
      setError(e?.message || "Błąd uruchamiania audytu");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div>
      <h2>Check-up (audyt startowy)</h2>

      <div style={{ display: "grid", gap: 12, maxWidth: 400 }}>
        <label>
          Czy zatrudniasz pracowników?
          <select
            value={answers.has_employees}
            onChange={(e) => setAnswers((a) => ({ ...a, has_employees: e.target.value }))}
          >
            <option value="yes">Tak</option>
            <option value="no">Nie</option>
          </select>
        </label>

        <label>
          Czy szkolenia BHP są aktualne?
          <select
            value={answers.bhp_training}
            onChange={(e) => setAnswers((a) => ({ ...a, bhp_training: e.target.value }))}
          >
            <option value="yes">Tak</option>
            <option value="no">Nie</option>
          </select>
        </label>

        <button onClick={submit} disabled={submitting}>
          {submitting ? "Uruchamiam..." : "Uruchom audyt"}
        </button>

        {error && <div style={{ color: "crimson" }}>{error}</div>}
      </div>

      {submitting && <Loader label="Analizuję odpowiedzi..." />}

      {result && (
        <div style={{ marginTop: 24 }}>
          <h3>Wynik</h3>
          <div>
            Score: {result?.score?.score}% ({result?.score?.level})
          </div>

          <h4>Ryzyka</h4>
          <ul>
            {Array.isArray(result?.risks) && result.risks.length > 0 ? (
              result.risks.map((r, i) => (
                <li key={i}>
                  <strong>{r.area}</strong> — {r.level}
                  <br />
                  {r.message}
                  {Array.isArray(r.actions) && r.actions.length > 0 && (
                    <ul>
                      {r.actions.map((a, j) => (
                        <li key={j}>{a}</li>
                      ))}
                    </ul>
                  )}
                </li>
              ))
            ) : (
              <li>Brak wykrytych ryzyk w podstawowym zakresie.</li>
            )}
          </ul>
        </div>
      )}
    </div>
  );
}
