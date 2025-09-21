export const LS_KEY = "ei-store-v1";

export const CHAT_SUGGESTIONS = [
  "Summarize latest docs",
  "Show related files",
  "Draft an email",
];

/* ---------------- ids & timestamps ---------------- */
export function makeId(prefix = "id") {
  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
}
export function genId(prefix = "id") {
  return makeId(prefix);
} // b/c for chat-window
export function daysAgo(n) {
  const d = new Date();
  d.setDate(d.getDate() - Number(n || 0));
  return d;
}
export const iso = (d) => (d instanceof Date ? d.toISOString() : d);

/* ---------------- date & label helpers ------------- */
export function isSameDay(a, b) {
  return (
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate()
  );
}
export function isYesterday(d, now = new Date()) {
  const y = new Date(now);
  y.setDate(now.getDate() - 1);
  return isSameDay(d, y);
}
export function pad(n) {
  return n < 10 ? `0${n}` : `${n}`;
}
export function formatTime(d) {
  let h = d.getHours();
  const m = pad(d.getMinutes());
  const ampm = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return `${h}:${m} ${ampm}`;
}
export function formatDate(d, locale) {
  return d.toLocaleDateString(locale, {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
}
export function messageLabel(d, now = new Date()) {
  const diffSec = Math.floor((now - d) / 1000);
  if (diffSec < 60) return "Just now";
  if (isSameDay(d, now)) return formatTime(d);
  if (isYesterday(d, now)) return "Yesterday";
  return formatDate(d);
}
export function headerLabel(d, now = new Date()) {
  if (isSameDay(d, now)) return "Today";
  if (isYesterday(d, now)) return "Yesterday";
  return formatDate(d);
}
export function parseDate(s) {
  return new Date(s);
}

/* ---------------- styling (MUI scrollbar) ----------- */
export function scrollbar(theme, color) {
  const alpha = (clr, a) =>
    `rgba(${parseInt(clr.slice(1, 3), 16)}, ${parseInt(
      clr.slice(3, 5),
      16
    )}, ${parseInt(clr.slice(5, 7), 16)}, ${a})`;
  return {
    scrollbarWidth: "thin",
    scrollbarColor: `${alpha(color, 0.7)} ${
      theme.palette.mode === "dark" ? "#0F1520" : "#E5E7EB"
    }`,
    "&::-webkit-scrollbar": { width: 10, height: 10 },
    "&::-webkit-scrollbar-track": {
      background: theme.palette.mode === "dark" ? "#0F1520" : "#F1F5F9",
      borderRadius: 8,
    },
    "&::-webkit-scrollbar-thumb": {
      background: alpha(color, 0.6),
      borderRadius: 8,
      border: `2px solid ${
        theme.palette.mode === "dark" ? "#0B0F14" : "#FFFFFF"
      }`,
    },
    "&::-webkit-scrollbar-thumb:hover": { background: alpha(color, 0.9) },
  };
}

/* ---------------- localStorage helpers -------------- */
export function safeJsonParse(raw, fallback) {
  try {
    return JSON.parse(raw);
  } catch {
    return typeof fallback === "function" ? fallback() : fallback ?? null;
  }
}
export function loadFromLocalStorage(key, fallbackFactory) {
  try {
    const raw = window.localStorage.getItem(key);
    if (raw) return JSON.parse(raw);
  } catch {}
  return typeof fallbackFactory === "function" ? fallbackFactory() : null;
}
export function saveToLocalStorage(key, value) {
  try {
    window.localStorage.setItem(key, JSON.stringify(value));
    return true;
  } catch {
    return false;
  }
}

/* ---------------- misc ------------------------------ */
export function sortByUpdatedAtDesc(items, key = "updatedAt") {
  return [...items].sort((a, b) => new Date(b[key]) - new Date(a[key]));
}
export const noop = () => {};
