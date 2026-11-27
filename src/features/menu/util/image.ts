const BASE = (
  import.meta.env.BLOB_BASE_URL ||
  import.meta.env.BASE_URL ||
  "/"
).replace(/\/+$/, "");

const FOLDERS = {
  thumb: "menu/products-thumb",
  full: "menu/products-full",
  popup: "menu/popup",
} as const;

type MenuImageKind = keyof typeof FOLDERS;

export function menuImageUrl(kind: MenuImageKind, file: string): string {
  return `${BASE}/${FOLDERS[kind]}/${file}`;
}
