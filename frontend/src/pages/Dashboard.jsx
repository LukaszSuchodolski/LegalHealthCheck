import { useEffect, useState } from "react";
import { getMe } from "@api/me";

export default function Dashboard() {
  const [me, setMe] = useState(null);
  const [err, setErr] = useState(null);

  useEffect(() => {
    getMe()
      .then(setMe)
      .catch((e) => setErr(e?.response?.data?.detail || e.message));
  }, []);

  return (
    <div>
      <h1>Dashboard</h1>
      {err && <pre style={{ color: "crimson" }}>{String(err)}</pre>}
      {me ? <pre>{JSON.stringify(me, null, 2)}</pre> : <div>Loading…</div>}
    </div>
  );
}
