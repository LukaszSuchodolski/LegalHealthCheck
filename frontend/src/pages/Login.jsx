import { useState } from "react";
import { login } from "@api/auth";
import { useAuth } from "@/auth/AuthContext";
import { useNavigate } from "react-router-dom";

export default function Login() {
  const [email, setEmail] = useState("demo@lhc.local");
  const [password, setPassword] = useState("demo123");
  const [err, setErr] = useState(null);
  const { loginOk } = useAuth();
  const nav = useNavigate();

  async function submit(e) {
    e.preventDefault();
    setErr(null);
    try {
      const data = await login({ email, password });
      loginOk(data);
      nav("/dashboard");
    } catch (e) {
      setErr(e?.response?.data?.detail || e?.message || "Login failed");
    }
  }

  return (
    <div>
      <h1>Login</h1>
      <form onSubmit={submit}>
        <div>
          <input
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email"
          />
        </div>
        <div>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="password"
          />
        </div>
        <button type="submit">Sign in</button>
      </form>
      {err && <pre style={{ color: "crimson" }}>{String(err)}</pre>}
    </div>
  );
}
