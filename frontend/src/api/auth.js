import http from "./http";

// LOGIN — form-data (OAuth2PasswordRequestForm)
export async function loginApi(username, password) {
  const body = new URLSearchParams();
  body.set("username", username);
  body.set("password", password);

  const { data } = await http.post("/auth/login", body, {
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
  });
  return data; // { access_token: "..." }
}

// REGISTER — JSON
export async function registerApi({ username, email, password }) {
  const { data } = await http.post("/auth/register", { username, email, password });
  return data;
}

// ME — do ewentualnej weryfikacji po zalogowaniu
export async function meApi() {
  const { data } = await http.get("/auth/me");
  return data;
}
