import type { DevinResearchReport } from "./devin.js";

function truncateResearchMemo(value: string, maximum: number): string {
  if (value.length <= maximum) return value;
  const startLength = Math.floor(maximum * 0.7);
  return `${value.slice(0, startLength)}\n… report truncated …\n${value.slice(-(maximum - startLength))}`;
}

export function formatDevinResearchContext(reports: DevinResearchReport[], maximum = 16_000): string {
  const successful = reports.filter((report) => report.status === "succeeded" && report.report.trim());
  if (!successful.length) return "";
  const perReport = Math.max(1_500, Math.floor(maximum / successful.length) - 100);
  return successful.map((report) => `### ${report.role} — ${report.strategy}\n${truncateResearchMemo(report.report.trim(), perReport)}`).join("\n\n").slice(0, maximum);
}
