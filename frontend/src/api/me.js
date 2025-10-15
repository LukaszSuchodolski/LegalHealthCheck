import http from "@api/http";
export async function getMe() {
  const { data } = await http.get("/api/v1/auth/me");
  return data; // { user_id, email, role }
}
