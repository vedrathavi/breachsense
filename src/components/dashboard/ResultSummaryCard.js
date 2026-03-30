// ResultSummaryCard.js
// This component displays a summary card for analysis results or key information.
// It is used to highlight important results, metrics, or insights in the dashboard.
//
// Main responsibilities:
//   - Render a styled card with title, icon, and content
//   - Support dark and light mode styling
//   - Provide optional tooltip for additional context
//
// Exports:
//   - ResultSummaryCard: React component for summary display

export default function ResultSummaryCard({
  title,
  icon: Icon,
  children,
  isDark = false,
  tooltip,
}) {
  return (
    <article
      className={`rounded-xl border p-4 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:shadow-md ${
        isDark
          ? "border-neutral-800 bg-neutral-900"
          : "border-neutral-200 bg-white"
      }`}
      title={tooltip}
    >
      <h3
        className={`inline-flex items-center gap-2 text-sm font-semibold ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
      >
        {Icon ? <Icon className="h-4 w-4" /> : null}
        {title}
      </h3>
      <div
        className={`mt-2 text-sm ${isDark ? "text-neutral-200" : "text-neutral-800"}`}
      >
        {children}
      </div>
    </article>
  );
}
