const BASE = (
  import.meta.env.VITE_BLOB_BASE_URL ||
  import.meta.env.BASE_URL ||
  "/"
).replace(/\/+$/, "");

function resolveMenuUrl(folder: string, file: string): string {
  if (/^(blob:|data:|https?:)/.test(file)) return file;
  return `${BASE}/menu/${folder}/${file}`;
}

export function productImageUrl(file: string): string {
  return resolveMenuUrl("products-full", file);
}

export function popupImageUrl(file: string): string {
  return resolveMenuUrl("popup", file);
}
