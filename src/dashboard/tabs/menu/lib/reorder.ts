export function moveId(
  ids: readonly number[],
  index: number,
  direction: -1 | 1
): number[] {
  const target = index + direction;
  if (target < 0 || target >= ids.length) return [...ids];

  const next = [...ids];
  const temp = next[index]!;
  next[index] = next[target]!;
  next[target] = temp;
  return next;
}

export function isSameOrder(a: readonly number[], b: readonly number[]): boolean {
  return a.length === b.length && a.every((id, i) => id === b[i]);
}
