import api from "@api/http";

export async function listResults() {
  const { data } = await api.get("/api/v1/checkup/results/list");
  return data;
}

export async function latestResult() {
  const { data } = await api.get("/api/v1/checkup/results/latest");
  return data;
}
