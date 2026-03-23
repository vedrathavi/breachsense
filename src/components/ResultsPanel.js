function severityBadgeClass(severity) {
  if (severity === "Critical") return "bg-red-600 text-white";
  if (severity === "High") return "bg-orange-500 text-white";
  if (severity === "Medium") return "bg-yellow-400 text-black";
  return "bg-emerald-500 text-white";
}

export default function ResultsPanel({ result }) {
  if (!result) return null;

  return (
    <section className="grid gap-4 rounded-xl border p-4">
      <h2 className="text-xl font-semibold">Breach and Legal Analysis</h2>

      <div className="grid gap-2 text-sm">
        <p>
          <strong>Breach Detected:</strong> {result.breachDetected ? "Yes" : "No"}
        </p>
        <p>
          <strong>Breach Type:</strong> {result.breachType}
        </p>
        <p>
          <strong>Severity:</strong>{" "}
          <span className={`rounded px-2 py-1 text-xs font-semibold ${severityBadgeClass(result.severity)}`}>
            {result.severity}
          </span>
        </p>
        <p>
          <strong>OWASP:</strong> {result.owaspMapping.id} - {result.owaspMapping.title}
        </p>
        <p>
          <strong>Affected Component:</strong> {result.affectedComponent}
        </p>
        <p>
          <strong>Summary:</strong> {result.summary}
        </p>
      </div>

      <div>
        <h3 className="mb-1 font-semibold">IT Act Sections</h3>
        <ul className="list-disc pl-5 text-sm">
          {result.legalAnalysis.itActSections.map((item, index) => (
            <li key={`${item.section}-${index}`}>
              {item.section} ({item.title}) - {item.reason}
            </li>
          ))}
        </ul>
      </div>

      <div>
        <h3 className="mb-1 font-semibold">DPDP Violations</h3>
        <ul className="list-disc pl-5 text-sm">
          {result.legalAnalysis.dpdpViolations.map((item, index) => (
            <li key={`${item.provision}-${index}`}>
              {item.provision} - {item.reason}
            </li>
          ))}
        </ul>
      </div>

      <p className="text-sm">
        <strong>Estimated Penalty Exposure:</strong> {result.legalAnalysis.estimatedPenalty}
      </p>

      <div>
        <h3 className="mb-1 font-semibold">Preventive Measures</h3>
        <ul className="list-disc pl-5 text-sm">
          {result.preventiveMeasures.map((measure, index) => (
            <li key={`${measure}-${index}`}>{measure}</li>
          ))}
        </ul>
      </div>
    </section>
  );
}
