// frontend/src/api/http.js
const BASE = import.meta.env.VITE_API_URL ?? "http://127.0.0.1:8000";
const ABSOLUTE_PROTOCOL = /^[a-zA-Z][a-zA-Z\d+.-]*:/;
const BASE_IS_ABSOLUTE =
  ABSOLUTE_PROTOCOL.test(BASE) || (typeof BASE === "string" && BASE.startsWith("//"));

function joinRelative(base, path) {
  if (!base) return path;
  if (!path) return base;

  const baseEndsWithSlash = base.endsWith("/");
  const pathStartsWithSlash = path.startsWith("/");

  if (baseEndsWithSlash && pathStartsWithSlash) return base + path.slice(1);
  if (!baseEndsWithSlash && !pathStartsWithSlash) return `${base}/${path}`;
  return base + path;
}

export function url(path = "") {
  if (!path) return BASE;
  if (ABSOLUTE_PROTOCOL.test(path) || path.startsWith("//")) return path;
  if (BASE_IS_ABSOLUTE) return new URL(path, BASE).toString();
  return joinRelative(BASE, path);
}

/** Niski poziom: jedno miejsce do fetchy */
export async function request(
  path,
  { method = "GET", body, token, headers: customHeaders, ...rest } = {},
) {
  const isFormData =
    typeof FormData !== "undefined" && body instanceof FormData;
  const hasBody = body !== null && body !== undefined;

  const headers = { ...(customHeaders ?? {}) };
  const hasContentType = Object.keys(headers).some(
    (key) => key.toLowerCase() === "content-type",
  );

  const isArrayBuffer =
    typeof ArrayBuffer !== "undefined" && body instanceof ArrayBuffer;
  const isArrayBufferView =
    typeof ArrayBuffer !== "undefined" &&
    typeof ArrayBuffer.isView === "function" &&
    ArrayBuffer.isView(body);
  const isBlob = typeof Blob !== "undefined" && body instanceof Blob;
  const isURLSearchParams =
    typeof URLSearchParams !== "undefined" && body instanceof URLSearchParams;
  const isReadableStream =
    typeof ReadableStream !== "undefined" && body instanceof ReadableStream;

  const shouldSerialize =
    hasBody &&
    !isFormData &&
    typeof body === "object" &&
    body !== null &&
    !isArrayBuffer &&
    !isArrayBufferView &&
    !isBlob &&
    !isURLSearchParams &&
    !isReadableStream;

  const shouldJsonify =
    shouldSerialize ||
    (hasBody &&
      !isFormData &&
      (typeof body === "number" || typeof body === "boolean"));

  let payload = body;
  if (shouldJsonify) {
    if (!hasContentType) headers["Content-Type"] = "application/json";
    payload = JSON.stringify(body);
  }

  if (token) headers["Authorization"] = `Bearer ${token}`;

  const res = await fetch(url(path), {
    method,
    headers,
    body: !hasBody ? undefined : isFormData ? body : payload,
    ...rest,
  });

  if (res.status === 204) return null;

  const data = await res.json().catch(() => null);
  if (!res.ok) {
    const err = new Error("HTTP error");
    err.status = res.status;
    err.data = data;
    throw err;
  }
  return data;
}

/** Wysoki poziom: wygodne metody */
const http = {
  request,
  get: (path, opts = {}) => request(path, { ...opts, method: "GET" }),
  post: (path, body, opts = {}) =>
    request(path, { ...opts, method: "POST", body }),
  put: (path, body, opts = {}) =>
    request(path, { ...opts, method: "PUT", body }),
  delete: (path, opts = {}) => request(path, { ...opts, method: "DELETE" }),
  url,
};

export default http; // ⬅️ eksport domyślny
