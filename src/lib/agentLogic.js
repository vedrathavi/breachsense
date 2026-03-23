import { strictOutputShape } from "./agentSchema";

export function buildAgentPrompt(input) {
  return `You are BreachSense's cyber-legal reasoning engine for India.

Analyze the incident scenario and produce a concise structured output for frontend rendering, system diagram mapping, and report generation.

Input:
- system: ${input.system}
- dataType: ${input.dataType}
- dataVolume: ${input.dataVolume}
- category: ${input.category}
- severityHint: ${input.severityHint}
- attackVector: ${input.attackVector}
- affectedUsers: ${input.affectedUsers}
- dataExposure: ${input.dataExposure}
- detectionTime: ${input.detectionTime}
- description: ${input.description}

Reasoning requirements:
1) Determine breach true/false using context, not only keywords.
2) Choose breach_type from: unauthorized_access, data_leak, insider_misuse, service_disruption, misconfiguration, social_engineering.
3) Set severity from: LOW, MEDIUM, HIGH, CRITICAL using severityHint + scenario context.
4) Map OWASP risk name and affected node from: frontend, backend, auth, database.
5) Provide legal analysis under IT Act 2000 and DPDP with concise relevant points.
6) Provide concise realistic penalty range as text.
7) Provide 3 to 5 actionable prevention points.
8) Provide short reason for why breach classification was chosen.
9) Provide detailed insight narratives for reporting:
  - executive_summary
  - attack_narrative
  - business_impact
  - legal_exposure_summary
  - confidence (LOW, MEDIUM, HIGH)
  - 2 to 5 evidence_signals
  - 3 to 6 priority_actions

Output requirements:
- Return ONLY valid JSON. Do not include explanations outside JSON.
- If uncertain, make the most logical assumption based on cybersecurity best practices.
- Do not add extra keys.
- Use this exact JSON structure and key names:
${JSON.stringify(strictOutputShape)}
`;
}

export function extractJsonObject(rawText) {
  if (typeof rawText !== "string") return null;

  const fenced = rawText.match(/```(?:json)?\s*([\s\S]*?)```/i);
  const candidate = fenced?.[1] || rawText;

  try {
    return JSON.parse(candidate);
  } catch {
    const start = candidate.indexOf("{");
    const end = candidate.lastIndexOf("}");
    if (start === -1 || end === -1 || end <= start) return null;

    const sliced = candidate.slice(start, end + 1);
    try {
      return JSON.parse(sliced);
    } catch {
      return null;
    }
  }
}
