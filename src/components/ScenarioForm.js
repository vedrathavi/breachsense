import {
  FiActivity,
  FiAlertTriangle,
  FiClock,
  FiDatabase,
  FiEdit3,
  FiFileText,
  FiGlobe,
  FiLayers,
  FiShield,
  FiTarget,
  FiUsers,
  FiZap,
} from "react-icons/fi";

function getInputClassName(isDark) {
  return `w-full rounded-lg border px-3 py-2 text-sm outline-none transition placeholder:text-neutral-400 focus:ring-2 ${
    isDark
      ? "border-neutral-800 bg-neutral-900 text-neutral-100 focus:border-neutral-500 focus:ring-neutral-600/40 autofill:!bg-neutral-900 autofill:!text-neutral-100"
      : "border-neutral-300 bg-neutral-100 text-neutral-900 focus:border-neutral-500 focus:ring-neutral-200 autofill:!bg-neutral-100 autofill:!text-neutral-900"
  }`;
  // Autofill override for input fields (Tailwind JIT required for arbitrary variants)
  // If not working, add the following to your global CSS (e.g., globals.css):
  // input:-webkit-autofill {
  //   -webkit-box-shadow: 0 0 0 1000px #f3f4f6 inset !important; /* bg-neutral-100 */
  //   -webkit-text-fill-color: #171717 !important; /* text-neutral-900 */
  // }
  // [data-theme="dark"] input:-webkit-autofill {
  //   -webkit-box-shadow: 0 0 0 1000px #171717 inset !important; /* bg-neutral-900 */
  //   -webkit-text-fill-color: #f3f4f6 !important; /* text-neutral-100 */
  // }
}

function LabelText({ icon: Icon, text, isDark }) {
  return (
    <span
      className={`inline-flex items-center gap-1.5 font-medium ${isDark ? "text-neutral-200" : "text-neutral-800"}`}
    >
      <Icon className="h-3.5 w-3.5" />
      {text}
    </span>
  );
}

function SelectField({
  label,
  icon,
  name,
  value,
  onChange,
  options,
  helperText,
  isDark,
}) {
  const inputClassName = getInputClassName(isDark);

  return (
    <label className="grid gap-1.5 text-sm">
      <LabelText icon={icon} text={label} isDark={isDark} />
      <select
        name={name}
        value={value}
        onChange={onChange}
        className={inputClassName}
      >
        {options.map((option) => (
          <option
            key={option}
            value={option}
            className={
              isDark ? "text-neutral-100 bg-neutral-900" : "text-neutral-900"
            }
          >
            {option}
          </option>
        ))}
      </select>
      {helperText ? (
        <span
          className={`text-xs ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
        >
          {helperText}
        </span>
      ) : null}
    </label>
  );
}

export default function ScenarioForm({
  form,
  onChange,
  errors = {},
  isDark = false,
}) {
  const inputClassName = getInputClassName(isDark);

  return (
    <section
      className={`rounded-2xl border p-6 shadow-sm transition-colors ${
        isDark
          ? "border-neutral-800 bg-neutral-900"
          : "border-neutral-200 bg-white"
      }`}
    >
      <h2
        className={`text-xl font-semibold ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
      >
        Incident Configuration
      </h2>

      <div className="mt-5 grid gap-5 md:grid-cols-2">
        <label className="grid gap-1.5 text-sm md:col-span-2">
          <LabelText
            icon={FiFileText}
            text="Incident Title / Breach Name"
            isDark={isDark}
          />
          <input
            name="incidentTitle"
            value={form.incidentTitle ?? ""}
            onChange={onChange}
            placeholder="e.g., Unauthorized Access to Patient Records"
            className={inputClassName}
          />
          {errors.incidentTitle ? (
            <span className="text-xs text-red-600">{errors.incidentTitle}</span>
          ) : null}
        </label>

        <SelectField
          label="System Type"
          icon={FiGlobe}
          name="systemType"
          value={form.systemType}
          onChange={onChange}
          isDark={isDark}
          options={[
            "Hospital / Healthcare System",
            "Banking / Financial System",
            "E-commerce Platform",
            "Government Database",
            "Educational Institution",
            "Cloud Service Provider",
          ]}
        />
        {errors.systemType ? (
          <p className="-mt-3 text-xs text-red-600">{errors.systemType}</p>
        ) : null}

        <SelectField
          label="Data Type"
          icon={FiDatabase}
          name="dataType"
          value={form.dataType}
          onChange={onChange}
          isDark={isDark}
          options={[
            "Personal Data",
            "Sensitive Personal Data",
            "Financial Data",
            "Health Records",
            "Biometric Data",
          ]}
          helperText="Select the primary data category impacted by the incident."
        />
        {errors.dataType ? (
          <p className="-mt-3 text-xs text-red-600">{errors.dataType}</p>
        ) : null}

        <SelectField
          label="Data Volume"
          icon={FiLayers}
          name="dataVolume"
          value={form.dataVolume}
          onChange={onChange}
          isDark={isDark}
          options={[
            "Low (few records)",
            "Medium (hundreds)",
            "High (thousands+)",
          ]}
        />

        <SelectField
          label="Incident Category"
          icon={FiAlertTriangle}
          name="incidentCategory"
          value={form.incidentCategory}
          onChange={onChange}
          isDark={isDark}
          options={[
            "Unauthorized Access",
            "Data Leak / Exposure",
            "Insider Misuse",
            "Service Disruption (DDoS)",
            "Phishing / Social Engineering",
            "Misconfiguration",
          ]}
        />

        <SelectField
          label="Severity Hint"
          icon={FiActivity}
          name="severityHint"
          value={form.severityHint}
          onChange={onChange}
          isDark={isDark}
          options={["LOW", "MEDIUM", "HIGH", "CRITICAL"]}
        />

        <SelectField
          label="Attack Vector"
          icon={FiTarget}
          name="attackVector"
          value={form.attackVector}
          onChange={onChange}
          isDark={isDark}
          options={[
            "Credential Theft",
            "Weak Authentication",
            "Malware Infection",
            "API Exploit",
            "Misconfigured Server",
            "Unknown",
          ]}
        />

        <SelectField
          label="Affected Users"
          icon={FiUsers}
          name="affectedUsers"
          value={form.affectedUsers}
          onChange={onChange}
          isDark={isDark}
          options={["Single User", "Multiple Users", "Large Population"]}
        />

        <SelectField
          label="Data Exposure Level"
          icon={FiShield}
          name="dataExposureLevel"
          value={form.dataExposureLevel}
          onChange={onChange}
          isDark={isDark}
          options={["No Exposure", "Partial Exposure", "Full Exposure"]}
        />

        <SelectField
          label="Detection Time"
          icon={FiClock}
          name="detectionTime"
          value={form.detectionTime}
          onChange={onChange}
          isDark={isDark}
          options={["Immediate", "Delayed", "Unknown"]}
        />

        <label className="grid gap-1.5 text-sm md:col-span-2">
          <LabelText
            icon={FiEdit3}
            text="Detailed Incident Description"
            isDark={isDark}
          />
          <textarea
            name="description"
            value={form.description}
            onChange={onChange}
            placeholder="Describe the incident in detail (e.g., multiple login failures followed by large data extraction from database)..."
            className={`${inputClassName} min-h-36 resize-y`}
          />
          {errors.description ? (
            <span className="text-xs text-red-600">{errors.description}</span>
          ) : null}
          <span
            className={`inline-flex items-center gap-1 text-xs ${isDark ? "text-neutral-400" : "text-neutral-500"}`}
          >
            <FiZap className="h-3.5 w-3.5" />
            Include sequence, scope, and observable impact for better downstream
            analysis.
          </span>
        </label>
      </div>
    </section>
  );
}
