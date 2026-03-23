"use client";

import dynamic from "next/dynamic";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  FiCopy,
  FiDroplet,
  FiFileText,
  FiMoon,
  FiRotateCcw,
  FiShield,
  FiSun,
  FiTarget,
} from "react-icons/fi";
import ScenarioForm from "@/components/ScenarioForm";
import PdfReportButton from "@/components/PdfReportButton";
import InputPanel from "@/components/dashboard/InputPanel";
import ResultSummaryCard from "@/components/dashboard/ResultSummaryCard";
import SeverityBadge from "@/components/dashboard/SeverityBadge";
import LegalCard from "@/components/dashboard/LegalCard";
import LoadingOverlay from "@/components/dashboard/LoadingOverlay";
import ErrorBanner from "@/components/dashboard/ErrorBanner";
import { getSeverityVisuals } from "@/lib/severityTheme";

const DiagramComponent = dynamic(() => import("@/components/SystemDiagram"), {
  ssr: false,
});

const initialForm = {
  incidentTitle: "",
  systemType: "Hospital / Healthcare System",
  dataType: "Sensitive Personal Data",
  dataVolume: "Medium (hundreds)",
  incidentCategory: "Unauthorized Access",
  severityHint: "HIGH",
  attackVector: "Credential Theft",
  affectedUsers: "Multiple Users",
  dataExposureLevel: "Partial Exposure",
  detectionTime: "Delayed",
  description: "",
};

function sanitizePayload(form) {
  const safe = (value) => (typeof value === "string" ? value.trim() : "");
  return {
    incidentTitle: safe(form.incidentTitle),
    system: safe(form.systemType),
    dataType: safe(form.dataType),
    dataVolume: safe(form.dataVolume),
    category: safe(form.incidentCategory),
    severityHint: safe(form.severityHint).toUpperCase(),
    attackVector: safe(form.attackVector),
    affectedUsers: safe(form.affectedUsers),
    dataExposure: safe(form.dataExposureLevel),
    detectionTime: safe(form.detectionTime),
    description: safe(form.description),
  };
}

function validateForm(form) {
  const safe = (value) => (typeof value === "string" ? value.trim() : "");
  const errors = {};
  if (!safe(form.systemType)) errors.systemType = "This field is required";
  if (!safe(form.dataType)) errors.dataType = "This field is required";
  if (!safe(form.description)) errors.description = "This field is required";
  if (!safe(form.incidentTitle))
    errors.incidentTitle = "This field is required";
  return errors;
}

function formatBreachType(value) {
  if (!value || typeof value !== "string") return "Not available";
  return value
    .split("_")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(" ");
}

function normalizeResult(payload, input) {
  const fallbackSeverity = input?.severityHint || "LOW";
  return {
    breach: typeof payload?.breach === "boolean" ? payload.breach : true,
    breach_type: payload?.breach_type || "unauthorized_access",
    severity: payload?.severity || fallbackSeverity,
    reason: payload?.reason || "Not available",
    owasp: {
      risk: payload?.owasp?.risk || "Not available",
      node: payload?.owasp?.node || "Not available",
    },
    legal: {
      it_act:
        Array.isArray(payload?.legal?.it_act) && payload.legal.it_act.length > 0
          ? payload.legal.it_act
          : ["Not available"],
      dpdp:
        Array.isArray(payload?.legal?.dpdp) && payload.legal.dpdp.length > 0
          ? payload.legal.dpdp
          : ["Not available"],
      penalty: payload?.legal?.penalty || "Not available",
    },
    prevention:
      Array.isArray(payload?.prevention) && payload.prevention.length > 0
        ? payload.prevention
        : ["Not available"],
    insights: {
      confidence: payload?.insights?.confidence || "MEDIUM",
      executive_summary:
        payload?.insights?.executive_summary || "Not available",
    },
  };
}

export default function Home() {
  const [formData, setFormData] = useState(initialForm);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [error, setError] = useState("");
  const [result, setResult] = useState(null);
  const [submittedInput, setSubmittedInput] = useState(null);
  const [diagramSnapshot, setDiagramSnapshot] = useState("");
  const [isDark, setIsDark] = useState(false);
  const [loadingHintIndex, setLoadingHintIndex] = useState(0);
  const requestLockRef = useRef(false);

  const normalizedForm = { ...initialForm, ...(formData || {}) };

  useEffect(() => {
    const stored = window.localStorage.getItem("breachsense-theme");
    if (stored === "dark") {
      setIsDark(true);
      return;
    }
    if (stored === "light") {
      setIsDark(false);
      return;
    }
    setIsDark(window.matchMedia("(prefers-color-scheme: dark)").matches);
  }, []);

  useEffect(() => {
    window.localStorage.setItem("breachsense-theme", isDark ? "dark" : "light");
  }, [isDark]);

  useEffect(() => {
    if (!loading) return undefined;
    const timer = setInterval(() => {
      setLoadingHintIndex((prev) => prev + 1);
    }, 1200);
    return () => clearInterval(timer);
  }, [loading]);

  const severityVisuals = useMemo(
    () => getSeverityVisuals(result?.severity || "LOW", isDark),
    [result?.severity, isDark],
  );

  function updateField(event) {
    const { name, value } = event.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  }

  async function runAnalysis() {
    if (loading || requestLockRef.current) return;

    const nextErrors = validateForm(normalizedForm);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    requestLockRef.current = true;
    setLoading(true);
    setError("");
    setResult(null);
    setDiagramSnapshot("");

    const payload = sanitizePayload(normalizedForm);
    setSubmittedInput(payload);

    try {
      const response = await fetch("/api/agent", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });

      const data = await response.json().catch(() => ({}));

      if (!response.ok || !data || typeof data !== "object") {
        throw new Error("API_ERROR");
      }

      if (data.error) {
        throw new Error(data.error);
      }

      setResult(normalizeResult(data, payload));
    } catch (caughtError) {
      if (caughtError instanceof TypeError) {
        setError("Network issue detected. Check connection.");
      } else {
        setError("⚠️ Analysis failed. Please try again.");
      }
    } finally {
      setLoading(false);
      requestLockRef.current = false;
    }
  }

  function resetInputs() {
    setFormData(initialForm);
    setErrors({});
    setError("");
    setResult(null);
    setSubmittedInput(null);
    setDiagramSnapshot("");
  }

  async function copyLegalOutput() {
    if (!result?.legal) return;
    const text = [
      `IT Act: ${(result.legal.it_act || []).join(", ")}`,
      `DPDP: ${(result.legal.dpdp || []).join(", ")}`,
      `Penalty: ${result.legal.penalty || "Not available"}`,
    ].join("\n");
    await navigator.clipboard.writeText(text);
  }

  return (
    <main
      className={`min-h-screen transition-colors duration-300 ${isDark ? "bg-neutral-950" : "bg-neutral-50"}`}
    >
      <div className="mx-auto w-full max-w-7xl px-4 py-8 md:px-8">
        <header className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div>
              <h1
                className={`text-4xl font-bold tracking-tight ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
              >
                BreachSense
              </h1>
              <p
                className={`text-base ${isDark ? "text-neutral-300" : "text-neutral-600"}`}
              >
                Agent-Based Cyber-Legal Analysis Framework
              </p>
            </div>
            {/* Theme Toggle Switch */}
            <label className="flex items-center cursor-pointer select-none gap-2">
              <span
                className={`text-xs font-medium ${isDark ? "text-neutral-300" : "text-neutral-700"}`}
              >
                {isDark ? "Dark" : "Light"}
              </span>
              <div className="relative">
                <input
                  type="checkbox"
                  checked={isDark}
                  onChange={() => setIsDark((prev) => !prev)}
                  className="sr-only peer"
                />
                <div
                  className={`w-10 h-5 rounded-full transition-colors duration-200 ${isDark ? "bg-neutral-700" : "bg-neutral-300"}`}
                ></div>
                <div
                  className={`absolute left-0.5 top-0.5 w-4 h-4 rounded-full transition-transform duration-200 ${isDark ? "bg-neutral-900 translate-x-5" : "bg-white translate-x-0"} shadow peer-checked:translate-x-5`}
                ></div>
                <span className="absolute left-1 top-1 text-xs">
                  {isDark ? (
                    <FiMoon className="h-3 w-3" />
                  ) : (
                    <FiSun className="h-3 w-3" />
                  )}
                </span>
              </div>
            </label>
          </div>
          <hr
            className={isDark ? "border-neutral-800" : "border-neutral-200"}
          />
        </header>

        <section className="mt-6 space-y-6">
          <InputPanel title="Incident Input" isDark={isDark}>
            <ScenarioForm
              form={normalizedForm}
              onChange={updateField}
              errors={errors}
              isDark={isDark}
            />
            <div className="mt-4 flex flex-col items-center justify-center gap-3 sm:flex-row">
              <button
                type="button"
                onClick={runAnalysis}
                disabled={loading}
                className={`w-full rounded-xl px-6 py-3 text-base font-semibold transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] disabled:cursor-not-allowed disabled:opacity-70 sm:w-auto flex items-center justify-center gap-2 ${
                  isDark
                    ? "bg-neutral-100 text-neutral-900 hover:bg-neutral-200 active:bg-neutral-300"
                    : "bg-neutral-800 text-neutral-100 hover:bg-neutral-900 active:bg-neutral-950"
                }`}
              >
                <FiShield className="h-5 w-5" />
                {loading ? "Analyzing incident..." : "Run Analysis"}
              </button>
              <button
                type="button"
                onClick={resetInputs}
                className={`inline-flex items-center gap-2 px-6 py-3 rounded-xl border text-sm font-medium transition-transform duration-150 hover:scale-[1.01] active:scale-[0.99] ${
                  isDark
                    ? "border-neutral-700 text-neutral-200 hover:bg-neutral-800"
                    : "border-neutral-300 text-neutral-700 hover:bg-neutral-50"
                }`}
              >
                <FiRotateCcw className="h-4 w-4" />
                Reset Inputs
              </button>
            </div>
          </InputPanel>

          {loading ? (
            <LoadingOverlay isDark={isDark} hintIndex={loadingHintIndex} />
          ) : null}
          <ErrorBanner message={error} isDark={isDark} />

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
              Analysis Result
            </h2>

            {!result && !loading && !error ? (
              <p
                className={`mt-3 text-sm ${isDark ? "text-neutral-300" : "text-neutral-700"}`}
              >
                👉 Configure an incident and run analysis to view results
              </p>
            ) : null}

            {result ? (
              <div className="mt-4 grid gap-4 transition-all duration-300 md:grid-cols-2">
                <ResultSummaryCard
                  title="Breach Type"
                  icon={FiShield}
                  isDark={isDark}
                >
                  <p>
                    <span className="font-semibold">Breach:</span>{" "}
                    {result.breach ? "Yes" : "No"}
                  </p>
                  <p>
                    <span className="font-semibold">Type:</span>{" "}
                    {formatBreachType(result.breach_type)}
                  </p>
                  <p>
                    <span className="font-semibold">Reason:</span>{" "}
                    {result.reason}
                  </p>
                </ResultSummaryCard>

                <ResultSummaryCard
                  title="Severity"
                  icon={FiTarget}
                  isDark={isDark}
                  tooltip="Severity indicates overall incident impact level"
                >
                  <SeverityBadge
                    severity={result.severity}
                    className={severityVisuals.badge}
                    title="AI-evaluated severity level"
                  />
                  <p className="mt-2 text-xs opacity-80">
                    AI Confidence: {result?.insights?.confidence || "MEDIUM"}
                  </p>
                </ResultSummaryCard>

                <ResultSummaryCard
                  title="OWASP Risk"
                  icon={FiTarget}
                  isDark={isDark}
                  tooltip="Mapped to likely OWASP attack category"
                >
                  <p title="Mapped OWASP category from scenario and response context">
                    <span className="font-semibold">Risk:</span>{" "}
                    {result.owasp.risk}
                  </p>
                  <p>
                    <span className="font-semibold">Node:</span>{" "}
                    {result.owasp.node}
                  </p>
                </ResultSummaryCard>

                <ResultSummaryCard
                  title="Incident Context"
                  icon={FiFileText}
                  isDark={isDark}
                >
                  <p>
                    <span className="font-semibold">System Type:</span>{" "}
                    {submittedInput?.system || "Not available"}
                  </p>
                  <p>
                    <span className="font-semibold">Data Type:</span>{" "}
                    {submittedInput?.dataType || "Not available"}
                  </p>
                  <p>
                    <span className="font-semibold">Category:</span>{" "}
                    {submittedInput?.category || "Not available"}
                  </p>
                </ResultSummaryCard>

                <div className="md:col-span-2 flex flex-wrap items-center gap-2">
                  <PdfReportButton
                    result={result}
                    scenario={submittedInput}
                    diagramImage={diagramSnapshot}
                  />
                  <button
                    type="button"
                    onClick={copyLegalOutput}
                    className={`inline-flex items-center gap-2 rounded-lg border px-3 py-2 text-sm transition ${
                      isDark
                        ? "border-gray-600 text-gray-200 hover:bg-gray-700"
                        : "border-gray-300 text-gray-700 hover:bg-gray-50"
                    }`}
                  >
                    <FiCopy className="h-4 w-4" />
                    Copy Legal Output
                  </button>
                </div>
              </div>
            ) : null}
          </section>

          {result ? (
            <section
              className={`rounded-2xl border p-6 shadow-sm transition-all duration-300 ${
                isDark
                  ? "border-neutral-700 bg-neutral-800"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h2
                className={`text-lg font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}
              >
                Threat Visualization
              </h2>
              <div className="mt-4">
                <DiagramComponent
                  systemType={
                    submittedInput?.system || normalizedForm.systemType
                  }
                  result={result}
                  incidentTitle={
                    submittedInput?.incidentTitle ||
                    normalizedForm.incidentTitle
                  }
                  onSnapshotChange={setDiagramSnapshot}
                  isDark={isDark}
                />
              </div>
            </section>
          ) : null}

          {result ? <LegalCard legal={result.legal} isDark={isDark} /> : null}

          {result ? (
            <section
              className={`rounded-2xl border p-6 shadow-sm transition-all duration-300 ${
                isDark
                  ? "border-neutral-800 bg-neutral-900"
                  : "border-gray-200 bg-white"
              }`}
            >
              <h2
                className={`text-lg font-semibold ${isDark ? "text-gray-100" : "text-gray-900"}`}
              >
                Mitigation & Recommendations
              </h2>
              <ul
                className={`mt-3 space-y-2 text-sm ${isDark ? "text-gray-200" : "text-gray-800"}`}
              >
                {(result.prevention || ["Not available"]).map((item, index) => (
                  <li
                    key={`${item}-${index}`}
                    className="flex items-start gap-2"
                  >
                    <FiDroplet
                      className={`mt-0.5 h-4 w-4 ${isDark ? "text-emerald-300" : "text-emerald-500"}`}
                    />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
        </section>
      </div>
    </main>
  );
}
