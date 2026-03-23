import { FiAlertTriangle } from "react-icons/fi";

export default function ErrorBanner({ message, isDark = false }) {
  if (!message) return null;
  return (
    <article
      className={`rounded-xl border p-4 ${
        isDark
          ? "border-red-400/40 bg-neutral-950 text-red-200"
          : "border-red-200 bg-red-50 text-red-700"
      }`}
    >
      <h3 className="inline-flex items-center gap-2 text-sm font-semibold">
        <FiAlertTriangle className="h-4 w-4" />
        Analysis Error
      </h3>
      <p className="mt-1 text-sm">{message}</p>
    </article>
  );
}
