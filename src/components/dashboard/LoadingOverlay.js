import { FiLoader } from "react-icons/fi";

const hints = [
  "Evaluating breach...",
  "Mapping legal implications...",
  "Generating analytical output...",
];

export default function LoadingOverlay({ isDark = false, hintIndex = 0 }) {
  const hint = hints[hintIndex % hints.length];
  return (
    <div
      className={`rounded-xl border p-4 ${
        isDark
          ? "border-neutral-700 bg-neutral-950 text-neutral-200"
          : "border-neutral-200 bg-neutral-50 text-neutral-700"
      }`}
    >
      <p className="inline-flex items-center gap-2 text-sm font-semibold">
        <FiLoader className="h-4 w-4 animate-spin" />
        Analyzing incident...
      </p>
      <p className="mt-1 text-xs opacity-90">{hint}</p>
    </div>
  );
}
