// severityTheme.js
// This module provides the mapping between severity levels and their corresponding UI theme styles in the BreachSense app.
// It is used to ensure consistent color coding and styling for severity badges and indicators throughout the UI.
//
// Main responsibilities:
//   - Map severity levels (e.g., Low, Medium, High, Critical) to color and style objects
//   - Export theme objects for use in React components
//
// Exports:
//   - severityTheme: Object mapping severity levels to theme styles

export const severityLevels = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];

export function normalizeSeverity(value) {
  const next = typeof value === "string" ? value.toUpperCase() : "LOW";
  return severityLevels.includes(next) ? next : "LOW";
}

export function getSeverityVisuals(value, isDark = false) {
  const severity = normalizeSeverity(value);

  const palette = {
    LOW: {
      cardBorder: isDark
        ? "border-l-4 border-l-emerald-400"
        : "border-l-4 border-l-emerald-500",
      cardTint: isDark ? "bg-emerald-950/30" : "bg-emerald-50",
      badge: isDark
        ? "border border-emerald-400/60 bg-emerald-500/20 text-emerald-200"
        : "border border-emerald-200 bg-emerald-100 text-emerald-700",
      nodeColor: isDark ? "#10b981" : "#16a34a",
      edgeColor: isDark ? "#34d399" : "#22c55e",
      edgeWidth: 3,
      glow: 14,
    },
    MEDIUM: {
      cardBorder: isDark
        ? "border-l-4 border-l-amber-300"
        : "border-l-4 border-l-amber-500",
      cardTint: isDark ? "bg-amber-900/25" : "bg-amber-50",
      badge: isDark
        ? "border border-amber-300/60 bg-amber-500/20 text-amber-100"
        : "border border-amber-200 bg-amber-100 text-amber-700",
      nodeColor: isDark ? "#f59e0b" : "#eab308",
      edgeColor: isDark ? "#fbbf24" : "#f59e0b",
      edgeWidth: 3.5,
      glow: 16,
    },
    HIGH: {
      cardBorder: isDark
        ? "border-l-4 border-l-orange-300"
        : "border-l-4 border-l-orange-500",
      cardTint: isDark ? "bg-orange-900/25" : "bg-orange-50",
      badge: isDark
        ? "border border-orange-300/60 bg-orange-500/20 text-orange-100"
        : "border border-orange-200 bg-orange-100 text-orange-700",
      nodeColor: isDark ? "#fb923c" : "#f97316",
      edgeColor: isDark ? "#fb923c" : "#ea580c",
      edgeWidth: 4.5,
      glow: 20,
    },
    CRITICAL: {
      cardBorder: isDark
        ? "border-l-4 border-l-rose-300"
        : "border-l-4 border-l-red-500",
      cardTint: isDark ? "bg-rose-950/30" : "bg-red-50",
      badge: isDark
        ? "border border-rose-300/60 bg-rose-500/20 text-rose-100"
        : "border border-red-200 bg-red-100 text-red-700",
      nodeColor: isDark ? "#ef4444" : "#b91c1c",
      edgeColor: isDark ? "#f87171" : "#dc2626",
      edgeWidth: 5.5,
      glow: 26,
    },
  };

  return { severity, ...palette[severity] };
}
