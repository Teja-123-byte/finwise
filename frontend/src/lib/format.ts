export const currency = (n: number, opts: { compact?: boolean } = {}) => {
  if (opts.compact) {
    if (Math.abs(n) >= 1_000_000) return `$${(n / 1_000_000).toFixed(2)}M`;
    if (Math.abs(n) >= 1_000) return `$${Math.round(n / 1_000)}k`;
    return `$${Math.round(n)}`;
  }
  return `$${Math.round(n).toLocaleString("en-US")}`;
};

export const number = (n: number, digits = 0) =>
  n.toLocaleString("en-US", { minimumFractionDigits: digits, maximumFractionDigits: digits });

export const roas = (n: number) => (Number.isFinite(n) ? `${n.toFixed(2)}x` : "—");

export const percent = (n: number, digits = 1) => `${(n * 100).toFixed(digits)}%`;

export const lerp = (a: number, b: number, t: number) => a + (b - a) * t;
