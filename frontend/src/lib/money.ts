export const inr = (n: number, opts: { compact?: boolean } = {}) => {
  const v = Math.round(n);
  if (opts.compact) {
    if (Math.abs(v) >= 100000) return `₹${(v / 100000).toFixed(1)}L`;
    if (Math.abs(v) >= 1000) return `₹${(v / 1000).toFixed(1)}k`;
    return `₹${v}`;
  }
  return `₹${v.toLocaleString("en-IN")}`;
};

export const pct = (n: number, digits = 0) => `${(n * 100).toFixed(digits)}%`;

const parseIsoDate = (iso: string) => {
  const date = iso.includes("T") ? new Date(iso) : new Date(`${iso}T00:00:00Z`);
  return isNaN(date.getTime()) ? new Date(0) : date;
};

export const shortDate = (iso: string) => {
  const date = parseIsoDate(iso);
  return isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-IN", {
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });
};

export const longDate = (iso: string) => {
  const date = parseIsoDate(iso);
  return isNaN(date.getTime())
    ? iso
    : date.toLocaleDateString("en-IN", {
        weekday: "short",
        day: "numeric",
        month: "short",
        timeZone: "UTC",
      });
};

export const todayIso = () => new Date().toISOString().slice(0, 10);

export const daysUntil = (iso: string) => {
  const date = parseIsoDate(iso);
  return Math.ceil((date.getTime() - Date.now()) / 86400000);
};
