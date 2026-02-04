/**
 * Shared utilities used across the app.
 */

export function parseNum(value: string | number | undefined | null): number | null {
  if (value == null) return null;
  if (typeof value === 'number') return Number.isNaN(value) ? null : value;
  const n = Number(value);
  return Number.isNaN(n) ? null : n;
}

export function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) {
    out.push(arr.slice(i, i + size));
  }
  return out;
}
