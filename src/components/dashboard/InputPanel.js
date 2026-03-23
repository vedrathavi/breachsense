export default function InputPanel({
  title = "Incident Input",
  children,
  isDark = false,
}) {
  return (
    <section
      className={`rounded-2xl border p-6 shadow-sm transition-all duration-300 ${
        isDark
          ? "border-neutral-800 bg-neutral-900"
          : "border-neutral-200 bg-white"
      }`}
    >
      <h2
        className={`text-lg font-semibold ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
      >
        {title}
      </h2>
      <div className="mt-4">{children}</div>
    </section>
  );
}
