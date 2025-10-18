import { useEffect, useState } from "react";
import { getQuestions, runCheckup } from "@api/checkup";

export default function Checkup() {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({}); // { question_id: boolean }
  const [result, setResult] = useState(null);
  const [err, setErr] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    getQuestions()
      .then((d) => {
        setQuestions(d.questions || []);
        // zainicjalizuj odpowiedzi na false
        const init = Object.fromEntries(
          (d.questions || []).map((q) => [q.id, false]),
        );
        setAnswers(init);
      })
      .catch((e) => setErr(e?.message || "Error"))
      .finally(() => setLoading(false));
  }, []);

  async function submit() {
    setErr(null);
    setResult(null);
    try {
      const res = await runCheckup(answers);
      setResult(res);
    } catch (e) {
      setErr(e?.message || "Request failed");
    }
  }

  if (loading) return <div>Loading…</div>;
  if (err) return <pre style={{ color: "crimson" }}>{String(err)}</pre>;

  return (
    <div>
      <h1>Checkup</h1>
      {questions.length === 0 ? (
        <p>Brak pytań.</p>
      ) : (
        <form
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <ul style={{ listStyle: "none", padding: 0 }}>
            {questions.map((q) => (
              <li key={q.id} style={{ marginBottom: 8 }}>
                <label>
                  <input
                    type="checkbox"
                    checked={!!answers[q.id]}
                    onChange={(e) =>
                      setAnswers((prev) => ({
                        ...prev,
                        [q.id]: e.target.checked,
                      }))
                    }
                  />{" "}
                  {q.text} {q.weight > 1 ? `(waga ${q.weight})` : ""}
                </label>
              </li>
            ))}
          </ul>
          <button type="submit">Wyślij</button>
        </form>
      )}

      {result && (
        <div style={{ marginTop: 16 }}>
          <h2>Wynik</h2>
          <p>
            <b>Score:</b> {result.score} / {result.max_score}
          </p>
          <ul>
            {result.recommendations.map((r, i) => (
              <li key={i}>{r}</li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
