export function fill(
  text: string,
  vars: Record<string, string | number>
): string {
  return text.replace(/\{(\w+)\}/g, (_, key: string) => String(vars[key] ?? ""));
}
