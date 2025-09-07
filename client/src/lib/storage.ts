export function getNumber(key: string, fallback = 0) {
  const v = localStorage.getItem(key);
  if (v == null) return fallback;
  const n = Number(v);
  return Number.isNaN(n) ? fallback : n;
}

export function setNumber(key: string, value: number) {
  localStorage.setItem(key, String(value));
}

