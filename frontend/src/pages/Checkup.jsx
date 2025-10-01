
import React, { useState } from 'react'
import { api } from '../api/client'

export default function Checkup() {
  const [answers, setAnswers] = useState({
    has_employees: 'no',
    bhp_training: 'yes',
  })
  const [result, setResult] = useState(null)

  const submit = async () => {
    const payload = Object.entries(answers).map(([question_id, value]) => ({ question_id, value }))
    const res = await api('/v1/audit/checkup', { method: 'POST', body: JSON.stringify(payload) })
    setResult(res)
  }

  return (
    <div>
      <h2>Check-up (audyt startowy)</h2>
      <div style={{ display: 'grid', gap: 12, maxWidth: 400 }}>
        <label>
          Czy zatrudniasz pracowników?
          <select value={answers.has_employees} onChange={e => setAnswers(a => ({...a, has_employees: e.target.value}))}>
            <option value="yes">Tak</option>
            <option value="no">Nie</option>
          </select>
        </label>
        <label>
          Czy szkolenia BHP są aktualne?
          <select value={answers.bhp_training} onChange={e => setAnswers(a => ({...a, bhp_training: e.target.value}))}>
            <option value="yes">Tak</option>
            <option value="no">Nie</option>
          </select>
        </label>
        <button onClick={submit}>Uruchom audyt</button>
      </div>

      {result && (
        <div style={{ marginTop: 24 }}>
          <h3>Wynik</h3>
          <div>Score: {result.score.score}% ({result.score.level})</div>
          <h4>Ryzyka</h4>
          <ul>
            {result.risks.length === 0 ? <li>Brak wykrytych ryzyk w podstawowym zakresie.</li> :
              result.risks.map((r, i) => (
                <li key={i}>
                  <strong>{r.area}</strong> — {r.level}<br/>
                  {r.message}
                  <ul>{r.actions.map((a, j) => <li key={j}>{a}</li>)}</ul>
                </li>
              ))
            }
          </ul>
        </div>
      )}
    </div>
  )
}
