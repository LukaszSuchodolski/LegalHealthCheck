import http from "@api/http";
export async function login({ email, password }) {
  const { data } = await http.post("/api/v1/auth/login", { email, password });
  return data; // {token, user_id, role}
}
