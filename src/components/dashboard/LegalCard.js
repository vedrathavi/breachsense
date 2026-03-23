export default function LegalCard({ legal, isDark = false }) {
  return (
    <article
      className={`rounded-xl border p-4 shadow-sm transition-all duration-300 ${
        isDark ? "border-neutral-800 bg-neutral-900" : "border-neutral-200 bg-white"
      }`}
    >
      <h3 className={`text-sm font-semibold ${isDark ? "text-neutral-100" : "text-neutral-900"}`}>Legal Output</h3>
      <div className="mt-3 grid gap-4 md:grid-cols-3">
        <div>
          <h4 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>IT Act Sections</h4>
          <ul className={`mt-2 list-disc space-y-1 pl-5 text-sm ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
            {(legal?.it_act || ["Not available"]).map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>DPDP Violations</h4>
          <ul className={`mt-2 list-disc space-y-1 pl-5 text-sm ${isDark ? "text-neutral-200" : "text-neutral-800"}`}>
            {(legal?.dpdp || ["Not available"]).map((item, index) => (
              <li key={`${item}-${index}`}>{item}</li>
            ))}
          </ul>
        </div>

        <div>
          <h4 className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-neutral-400" : "text-neutral-600"}`}>Penalty</h4>
          <p
            title="Estimated legal/financial exposure under applicable provisions"
            className={`mt-2 rounded-md border p-3 text-sm font-semibold ${
              isDark ? "border-neutral-700 bg-neutral-950 text-neutral-100" : "border-neutral-200 bg-neutral-50 text-neutral-900"
            }`}
          >
            {legal?.penalty || "Not available"}
          </p>
        </div>
      </div>
    </article>
  );
}
