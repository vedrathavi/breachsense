export const allowedBreachTypes = [
  "unauthorized_access",
  "data_leak",
  "insider_misuse",
  "service_disruption",
  "misconfiguration",
  "social_engineering",
];

export const allowedSeverity = ["LOW", "MEDIUM", "HIGH", "CRITICAL"];
export const allowedNodes = ["frontend", "backend", "auth", "database"];
export const allowedConfidence = ["LOW", "MEDIUM", "HIGH"];

export const strictOutputShape = {
  breach: true,
  breach_type: "unauthorized_access",
  severity: "HIGH",
  owasp: {
    risk: "Broken Access Control",
    node: "auth",
  },
  legal: {
    it_act: ["Section 43A", "Section 72A"],
    dpdp: ["Failure of security safeguards"],
    penalty:
      "Likely monetary liability; potential high-value regulatory penalty depending on impact.",
  },
  prevention: [
    "Enable MFA for all privileged accounts",
    "Enforce least-privilege access",
    "Encrypt sensitive data at rest and in transit",
  ],
  insights: {
    executive_summary:
      "Unauthorized credential use led to probable access compromise of sensitive records.",
    attack_narrative:
      "Likely path: credential theft -> weak auth validation -> backend query abuse -> sensitive data access.",
    business_impact:
      "Elevated customer trust and operational disruption risk with potential notification obligations.",
    legal_exposure_summary:
      "Material exposure under IT Act and DPDP due to safeguards failure and sensitive data handling lapses.",
    confidence: "HIGH",
    evidence_signals: [
      "Abnormal login pattern from unusual source",
      "Data query spike beyond baseline",
      "Delayed detection window increased exposure",
    ],
    priority_actions: [
      "Revoke active sessions and rotate privileged credentials",
      "Enable adaptive MFA and anomaly-based blocking",
      "Preserve forensic logs and initiate legal/compliance response",
    ],
  },
  reason:
    "Credential compromise and abnormal access pattern indicate unauthorized access.",
};

const requiredInputKeys = [
  "system",
  "dataType",
  "dataVolume",
  "category",
  "severityHint",
  "attackVector",
  "affectedUsers",
  "dataExposure",
  "detectionTime",
  "description",
];

function isNonEmptyString(value) {
  return typeof value === "string" && value.trim().length > 0;
}

export function normalizeInput(body) {
  const input = {};
  requiredInputKeys.forEach((key) => {
    input[key] = typeof body?.[key] === "string" ? body[key].trim() : "";
  });
  return input;
}

export function validateInputPayload(body) {
  if (!body || typeof body !== "object") return false;
  return requiredInputKeys.every((key) => typeof body[key] === "string");
}

export function validateAgentOutput(payload) {
  if (!payload || typeof payload !== "object") return false;
  if (typeof payload.breach !== "boolean") return false;
  if (!allowedBreachTypes.includes(payload.breach_type)) return false;
  if (!allowedSeverity.includes(payload.severity)) return false;

  if (!payload.owasp || typeof payload.owasp !== "object") return false;
  if (!isNonEmptyString(payload.owasp.risk)) return false;
  if (!allowedNodes.includes(payload.owasp.node)) return false;

  if (!payload.legal || typeof payload.legal !== "object") return false;
  if (
    !Array.isArray(payload.legal.it_act) ||
    payload.legal.it_act.some((item) => !isNonEmptyString(item))
  ) {
    return false;
  }
  if (
    !Array.isArray(payload.legal.dpdp) ||
    payload.legal.dpdp.some((item) => !isNonEmptyString(item))
  ) {
    return false;
  }
  if (!isNonEmptyString(payload.legal.penalty)) return false;

  if (
    !Array.isArray(payload.prevention) ||
    payload.prevention.length < 3 ||
    payload.prevention.length > 5 ||
    payload.prevention.some((item) => !isNonEmptyString(item))
  ) {
    return false;
  }

  if (!payload.insights || typeof payload.insights !== "object") return false;
  if (!isNonEmptyString(payload.insights.executive_summary)) return false;
  if (!isNonEmptyString(payload.insights.attack_narrative)) return false;
  if (!isNonEmptyString(payload.insights.business_impact)) return false;
  if (!isNonEmptyString(payload.insights.legal_exposure_summary)) return false;
  if (!allowedConfidence.includes(payload.insights.confidence)) return false;

  if (
    !Array.isArray(payload.insights.evidence_signals) ||
    payload.insights.evidence_signals.length < 2 ||
    payload.insights.evidence_signals.length > 5 ||
    payload.insights.evidence_signals.some((item) => !isNonEmptyString(item))
  ) {
    return false;
  }

  if (
    !Array.isArray(payload.insights.priority_actions) ||
    payload.insights.priority_actions.length < 3 ||
    payload.insights.priority_actions.length > 6 ||
    payload.insights.priority_actions.some((item) => !isNonEmptyString(item))
  ) {
    return false;
  }

  if (!isNonEmptyString(payload.reason)) return false;
  return true;
}
