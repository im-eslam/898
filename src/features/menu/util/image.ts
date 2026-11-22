const BASE = import.meta.env?.BASE_URL ?? "/";

const FOLDERS = {
  thumb: "menu/products-thumb",
  full: "menu/products-full",
  popup: "menu/popup",
} as const;

type MenuImageKind = keyof typeof FOLDERS;

export function menuImageUrl(kind: MenuImageKind, file: string): string {
  const name = kind === "thumb" ? file.replace(/(\.[^.]+)$/, "@400w$1") : file;
  return `${BASE}${FOLDERS[kind]}/${name}`;
}
