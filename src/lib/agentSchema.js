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
    india: {
      it_act: ["Section 43A"],
      dpdp: ["Failure of security safeguards"]
    },
    international: {
      gdpr: {
        applicable: false,
        articles: [],
        penalty: ""
      },
      hipaa: {
        applicable: false,
        provisions: [],
        penalty: ""
      },
      others: []
    },
    overall_penalty: ""
  },
  prevention: [
    "Enable MFA for all privileged accounts",
    "Enforce least-privilege access",
    "Encrypt sensitive data at rest and in transit"
  ],
  reason: "Credential compromise and abnormal access pattern indicate unauthorized access."
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

  // Validate new legal structure
  if (!payload.legal || typeof payload.legal !== "object") return false;
  // India
  if (!payload.legal.india || typeof payload.legal.india !== "object") return false;
  if (!Array.isArray(payload.legal.india.it_act) || payload.legal.india.it_act.some((item) => !isNonEmptyString(item))) return false;
  if (!Array.isArray(payload.legal.india.dpdp) || payload.legal.india.dpdp.some((item) => !isNonEmptyString(item))) return false;
  // International
  if (!payload.legal.international || typeof payload.legal.international !== "object") return false;
  // GDPR
  const gdpr = payload.legal.international.gdpr;
  if (!gdpr || typeof gdpr !== "object" || typeof gdpr.applicable !== "boolean" || !Array.isArray(gdpr.articles) || typeof gdpr.penalty !== "string") return false;
  // HIPAA
  const hipaa = payload.legal.international.hipaa;
  if (!hipaa || typeof hipaa !== "object" || typeof hipaa.applicable !== "boolean" || !Array.isArray(hipaa.provisions) || typeof hipaa.penalty !== "string") return false;
  // Others
  if (!Array.isArray(payload.legal.international.others)) return false;
  // Overall penalty
  if (typeof payload.legal.overall_penalty !== "string") return false;

  if (!Array.isArray(payload.prevention) || payload.prevention.length < 3 || payload.prevention.length > 5 || payload.prevention.some((item) => !isNonEmptyString(item))) return false;

  if (!isNonEmptyString(payload.reason)) return false;
  return true;
}
