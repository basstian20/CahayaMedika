// Wrapper tipis di atas console.log/console.error, terstruktur JSON — cukup untuk
// dibaca lewat Vercel function logs (TSD §6, Deployment Plan §6). Tidak ada library
// eksternal — [ASUMSI: konsisten dengan keputusan anti-over-engineering TSD §2/§3.1,
// diwarisi dari Backend Blueprint §7]

type LogLevel = "info" | "warn" | "error";

interface LogPayload {
  level: LogLevel;
  event: string;
  [key: string]: unknown;
}

function log(level: LogLevel, event: string, meta: Record<string, unknown> = {}) {
  const payload: LogPayload = { level, event, timestamp: new Date().toISOString(), ...meta };
  const line = JSON.stringify(payload);
  if (level === "error") console.error(line);
  else if (level === "warn") console.warn(line);
  else console.log(line);
}

export const logger = {
  info: (event: string, meta?: Record<string, unknown>) => log("info", event, meta),
  warn: (event: string, meta?: Record<string, unknown>) => log("warn", event, meta),
  error: (event: string, meta?: Record<string, unknown>) => log("error", event, meta),
};
