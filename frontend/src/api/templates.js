import http from "@api/http";

export async function getTemplates() {
  const { data } = await http.get("/api/v1/documents/templates");
  return data; // [{ id, title, category, status }]
}

export async function generateDocument(docId, payload) {
  const res = await http.post(
    `/api/v1/documents/generate/${encodeURIComponent(docId)}`,
    payload,
    { responseType: "blob" },
  );

  // Spróbuj wyciągnąć nazwę z Content-Disposition
  let filename = `generated_${docId}.txt`;
  const cd = res.headers?.["content-disposition"];
  if (cd) {
    const m = /filename="?([^"]+)"?/i.exec(cd);
    if (m?.[1]) filename = m[1];
  }
  return { blob: res.data, filename };
}
