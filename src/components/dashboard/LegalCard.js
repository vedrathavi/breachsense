export default function LegalCard({ legal, isDark = false }) {
  // Defensive fallback for legacy/empty
  const india = legal?.india || {};
  const intl = legal?.international || {};
  const gdpr = intl?.gdpr || { applicable: false };
  const hipaa = intl?.hipaa || { applicable: false };
  const others = Array.isArray(intl?.others) ? intl.others : [];
  const overallPenalty = legal?.overall_penalty || "Not available";
  console.log("LegalCard others:", others);
  // Debug logging to verify data received by LegalCard
  console.log("[LegalCard] india:", india);
  console.log("[LegalCard] intl:", intl);
  console.log("[LegalCard] gdpr:", gdpr);
  console.log("[LegalCard] hipaa:", hipaa);
  console.log("[LegalCard] others:", others);
  return (
    <article
      className={`rounded-xl border p-4 shadow-sm transition-all duration-300 ${
        isDark
          ? "border-neutral-800 bg-neutral-900"
          : "border-neutral-200 bg-white"
      }`}
    >
      <h3
        className={`text-sm font-semibold ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
      >
        Legal Output
      </h3>
      <div className="mt-3 grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {/* INDIA SECTION */}
        <div>
          <h4
            className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
          >
            IT Act Sections
          </h4>
          <ul
            className={`mt-2 list-disc space-y-1 pl-5 text-sm ${isDark ? "text-neutral-200" : "text-neutral-800"}`}
          >
            {(india.it_act && india.it_act.length > 0
              ? india.it_act
              : ["Not applicable"]
            ).map((item, idx) => (
              <li key={`itact-${item}-${idx}`}>{item}</li>
            ))}
          </ul>
        </div>
        <div>
          <h4
            className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
          >
            DPDP Violations
          </h4>
          <ul
            className={`mt-2 list-disc space-y-1 pl-5 text-sm ${isDark ? "text-neutral-200" : "text-neutral-800"}`}
          >
            {(india.dpdp && india.dpdp.length > 0
              ? india.dpdp
              : ["Not applicable"]
            ).map((item, idx) => (
              <li key={`dpdp-${item}-${idx}`}>{item}</li>
            ))}
          </ul>
        </div>

        {/* INTERNATIONAL SECTION */}
        <div className="lg:col-span-1 md:col-span-2">
          <h4
            className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
          >
            International Laws
          </h4>
          <div className="mt-2 space-y-2">
            <div>
              <span className={isDark ? "font-semibold text-neutral-200" : "font-semibold text-neutral-800"}>GDPR: </span>
              {Boolean(gdpr?.applicable) ? (
                <>
                  <span className={isDark ? "font-normal text-neutral-200" : "font-normal text-neutral-800"}>Articles: </span>
                  {Array.isArray(gdpr?.articles) && gdpr.articles.length > 0 ? (
                    <ul className={isDark ? "list-disc pl-5 text-neutral-200" : "list-disc pl-5 text-neutral-800"}>
                      {gdpr.articles.map((art, idx) => (
                        <li key={`gdpr-article-${art}-${idx}`}>{art}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>Not specified</span>
                  )}
                  <div>
                    <span className={isDark ? "font-normal text-neutral-200" : "font-normal text-neutral-800"}>Penalty: </span>
                    <span className={isDark ? "text-neutral-200" : "text-neutral-800"}>{gdpr.penalty || "Not specified"}</span>
                  </div>
                </>
              ) : (
                <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>Not Applicable</span>
              )}
            </div>
            <div>
              <span className={isDark ? "font-semibold text-neutral-200" : "font-semibold text-neutral-800"}>HIPAA: </span>
              {Boolean(hipaa?.applicable) ? (
                <>
                  <span className={isDark ? "font-normal text-neutral-200" : "font-normal text-neutral-800"}>Provisions: </span>
                  {Array.isArray(hipaa?.provisions) && hipaa.provisions.length > 0 ? (
                    <ul className={isDark ? "list-disc pl-5 text-neutral-200" : "list-disc pl-5 text-neutral-800"}>
                      {hipaa.provisions.map((prov, idx) => (
                        <li key={`hipaa-prov-${prov}-${idx}`}>{prov}</li>
                      ))}
                    </ul>
                  ) : (
                    <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>Not specified</span>
                  )}
                  <div>
                    <span className={isDark ? "font-normal text-neutral-200" : "font-normal text-neutral-800"}>Penalty: </span>
                    <span className={isDark ? "text-neutral-200" : "text-neutral-800"}>{hipaa.penalty || "Not specified"}</span>
                  </div>
                </>
              ) : (
                <span className={isDark ? "text-neutral-400" : "text-neutral-500"}>Not Applicable</span>
              )}
            </div>
            {others.length > 0 && (
              <div>
                <span className={isDark ? "font-semibold text-neutral-200" : "font-semibold text-neutral-800"}>Other Frameworks: </span>
                <ul className={isDark ? "list-disc pl-5 text-neutral-200" : "list-disc pl-5 text-neutral-800"}>
                  {others.map((other, idx) =>
                    typeof other === "string" ? (
                      <li key={`otherlaw-${idx}`}>{other}</li>
                    ) : (
                      <li
                        key={`otherlaw-${other.framework || idx}`}
                        className="mb-2"
                      >
                        <div>
                          <span className={isDark ? "font-semibold text-neutral-200" : "font-semibold text-neutral-800"}>
                            {other.framework || "Unknown"}:
                          </span>
                          {other.violation && (
                            <>
                              <span className={isDark ? "font-normal text-neutral-200" : "font-normal text-neutral-800"}> Violation: </span>
                              <span className={isDark ? "text-neutral-200" : "text-neutral-800"}>{other.violation}</span>
                            </>
                          )}
                          {other.penalty && (
                            <>
                              <br />
                              <span className={isDark ? "font-normal text-neutral-200" : "font-normal text-neutral-800"}>Penalty: </span>
                              <span className={isDark ? "text-neutral-200" : "text-neutral-800"}>{other.penalty}</span>
                            </>
                          )}
                        </div>
                      </li>
                    ),
                  )}
                </ul>
              </div>
            )}
          </div>
        </div>

        {/* OVERALL PENALTY */}
        <div className="md:col-span-2 lg:col-span-3">
          <h4
            className={`text-xs font-semibold uppercase tracking-wide ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
          >
            Overall Penalty
          </h4>
          <p
            title="Estimated legal/financial exposure under all applicable provisions"
            className={`mt-2 rounded-md border p-3 text-sm font-semibold ${
              isDark
                ? "border-neutral-700 bg-neutral-950 text-neutral-100"
                : "border-neutral-200 bg-neutral-50 text-neutral-900"
            }`}
          >
            {overallPenalty}
          </p>
        </div>
      </div>
    </article>
  );
}
