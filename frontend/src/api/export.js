import http from "@api/http";

/** @param {{score:number, max_score:number, recommendations:string[], company_name?:string}} payload */
export async function downloadCheckupPdf(payload) {
  const response = await http.post("/checkup/export", payload, { responseType: "blob" });
  return response.data; // Blob
}
