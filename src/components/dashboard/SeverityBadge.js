// SeverityBadge.js
// This component displays a badge representing the severity level of a breach or risk.
// It uses icons and color coding to visually indicate severity.
//
// Main responsibilities:
//   - Render a badge with severity label and icon
//   - Support different severity levels (LOW, MEDIUM, HIGH, CRITICAL)
//   - Support dark and light mode styling
//
// Exports:
//   - SeverityBadge: React component for severity display

import { FiAlertTriangle, FiCheckCircle, FiInfo, FiZap } from "react-icons/fi";

function iconNodeForSeverity(level) {
  if (level === "CRITICAL") return <FiAlertTriangle className="h-4 w-4" />;
  if (level === "HIGH") return <FiZap className="h-4 w-4" />;
  if (level === "MEDIUM") return <FiInfo className="h-4 w-4" />;
  return <FiCheckCircle className="h-4 w-4" />;
}

export default function SeverityBadge({
  severity = "LOW",
  className = "",
  title,
}) {
  const iconNode = iconNodeForSeverity(severity);
  return (
    <span
      title={title}
      className={`inline-flex items-center gap-1 rounded-full px-2 py-1 text-xs font-bold ${className}`}
    >
      {iconNode}
      {severity}
    </span>
  );
}
