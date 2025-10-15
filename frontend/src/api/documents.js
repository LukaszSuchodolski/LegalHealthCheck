import http from "@api/http";

export async function listUploads() {
  const { data } = await http.get("/api/v1/documents/uploads");
  return data; // [{ filename, size, content_type, uploaded_at }, ...]
}

export async function uploadDocument(file) {
  const form = new FormData();
  form.append("file", file);
  const { data } = await http.post("/api/v1/documents/upload", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return data; // { filename, size, ... }
}
export async function deleteDocument(filename) {
  const { data } = await http.delete(`/api/v1/documents/delete/${encodeURIComponent(filename)}`);
  return data; // { deleted }
}
