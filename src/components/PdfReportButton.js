"use client";

import { jsPDF } from "jspdf";
import { FiDownload } from "react-icons/fi";

function safeText(value, fallback = "Not provided") {
  if (typeof value !== "string") return fallback;
  const normalized = value
    .replace(/\u00A0/g, " ")
    .replace(/\s+/g, " ")
    .trim();
  if (!normalized) return fallback;

  const collapsedLetterSpaced = normalized.replace(
    /\b(?:[A-Za-z]\s+){2,}[A-Za-z]\b/g,
    (match) => match.replace(/\s+/g, "")
  );

  const tokens = collapsedLetterSpaced.split(" ");
  const rebuilt = [];

  for (let index = 0; index < tokens.length; index += 1) {
    const token = tokens[index];

    if (/^[A-Za-z]$/.test(token)) {
      let cursor = index;
      let chunk = "";
      while (cursor < tokens.length && /^[A-Za-z]$/.test(tokens[cursor])) {
        chunk += tokens[cursor];
        cursor += 1;
      }

      if (chunk.length >= 3) {
        rebuilt.push(chunk);
        index = cursor - 1;
        continue;
      }
    }

    rebuilt.push(token);
  }

  return rebuilt.join(" ") || fallback;
}

function safeList(value, fallback = "Not specified") {
  if (!Array.isArray(value) || value.length === 0) return [fallback];
  return value.map((item) => safeText(item, fallback));
}

function splitLongToken(token, chunkSize = 18) {
  if (token.length <= chunkSize) return token;
  const chunks = [];
  for (let index = 0; index < token.length; index += chunkSize) {
    chunks.push(token.slice(index, index + chunkSize));
  }
  return chunks.join(" ");
}

function wrapSafeText(value) {
  const normalized = safeText(value, "");
  if (!normalized) return "Not provided";

  return normalized
    .split(" ")
    .map((token) => splitLongToken(token))
    .join(" ");
}

function prettyLabel(value) {
  return safeText(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

function deriveOwaspFallback(scenario, breachType) {
  const category = safeText(scenario?.category, "").toLowerCase();
  const vector = safeText(scenario?.attackVector, "").toLowerCase();
  const breach = safeText(breachType, "").toLowerCase();

  if (vector.includes("credential") || breach.includes("unauthorized")) {
    return { risk: "Identification and Authentication Failures", node: "auth" };
  }
  if (category.includes("misconfiguration") || breach.includes("misconfiguration")) {
    return { risk: "Security Misconfiguration", node: "backend" };
  }
  if (category.includes("data leak") || breach.includes("data_leak")) {
    return { risk: "Cryptographic Failures", node: "database" };
  }
  if (category.includes("phishing") || breach.includes("social_engineering")) {
    return { risk: "Broken Access Control", node: "frontend" };
  }
  return { risk: "Broken Access Control", node: "backend" };
}

function detectPenaltySeverity(text) {
  const content = sanitizePenaltyText(text).toLowerCase();
  if (!content) return "LOW";
  if (content.includes("250") || content.includes("crore")) return "CRITICAL";
  if (content.includes("high") || content.includes("major")) return "HIGH";
  if (content.includes("moderate")) return "MEDIUM";
  return "LOW";
}

function sanitizePenaltyText(value) {
  if (typeof value !== "string") return "Not provided";

  const cleaned = value
    .normalize("NFKC")
    .replace(/[\u200B-\u200F\u202A-\u202E\u2060\uFEFF]/g, "")
    .replace(/<[^>]*>/g, " ")
    .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
    .replace(/[*_`~#]/g, " ");

  return safeText(cleaned);
}

function buildNormalizedResult(result, scenario) {
  const fallbackOwasp = deriveOwaspFallback(scenario, result?.breach_type);
  const severity = safeText(result?.severity, "LOW");

  const fallbackPenalty =
    severity === "CRITICAL"
      ? "Potential penalties may reach the upper DPDP threshold, with additional civil liability under relevant IT Act provisions."
      : severity === "HIGH"
        ? "Significant monetary penalties are possible under DPDP and compensatory exposure may apply under the IT Act."
        : severity === "MEDIUM"
          ? "Moderate regulatory exposure possible depending on safeguards and incident response timeliness."
          : "Limited regulatory exposure, subject to demonstrated safeguards and remediation evidence.";

  const fallbackReason = `Scenario signals indicate ${safeText(result?.breach_type, "potential breach").replace(/_/g, " ")} with ${severity.toLowerCase()} risk context.`;

  return {
    breach: typeof result?.breach === "boolean" ? result.breach : true,
    breach_type: safeText(result?.breach_type, "unauthorized_access"),
    severity,
    reason: safeText(result?.reason, fallbackReason),
    owasp: {
      risk: safeText(result?.owasp?.risk, fallbackOwasp.risk),
      node: safeText(result?.owasp?.node, fallbackOwasp.node),
    },
    legal: {
      it_act: safeList(result?.legal?.it_act, "Section 43A (Failure to protect sensitive personal data)"),
      dpdp: safeList(result?.legal?.dpdp, "Failure to implement reasonable security safeguards"),
      penalty: sanitizePenaltyText(result?.legal?.penalty || fallbackPenalty),
    },
    prevention: safeList(result?.prevention, "Implement immediate containment and hardening controls"),
    insights: {
      executive_summary: safeText(
        result?.insights?.executive_summary,
        `${safeText(scenario?.category, "Incident")} likely impacted ${safeText(scenario?.system, "the target system")} with elevated compliance risk.`
      ),
      attack_narrative: safeText(
        result?.insights?.attack_narrative,
        `Likely path: ${safeText(scenario?.attackVector, "initial compromise")} -> privileged/system access -> potential data/system impact.`
      ),
      business_impact: safeText(
        result?.insights?.business_impact,
        `Potential impact includes service trust erosion, incident response overhead, and regulatory scrutiny for ${safeText(
          scenario?.dataType,
          "sensitive data"
        )}.`
      ),
      legal_exposure_summary: safeText(
        result?.insights?.legal_exposure_summary,
        "Potential exposure under IT Act and DPDP obligations due to safeguard and breach-notification expectations."
      ),
      confidence: safeText(result?.insights?.confidence, "MEDIUM").toUpperCase(),
      evidence_signals: safeList(result?.insights?.evidence_signals, "Incident pattern and context indicate a credible compromise scenario"),
      priority_actions: safeList(result?.insights?.priority_actions, "Contain affected access paths and initiate legal/compliance workflow"),
    },
  };
}

function detectConfidenceColor(confidence, colors) {
  if (confidence === "HIGH") return colors.green;
  if (confidence === "MEDIUM") return colors.yellow;
  return colors.orange;
}

export default function PdfReportButton({ result, scenario, diagramImage }) {
  if (!result || !scenario) return null;

  // Always use light theme for diagram in PDF
  function getLightDiagramImage() {
    // If diagramImage is a function that can take a theme, call with isDark=false
    if (typeof diagramImage === "function") {
      return diagramImage(false);
    }
    // If it's a string (data URL), just use as is (assume light theme)
    return diagramImage;
  }

  function downloadPdf() {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const normalizedResult = buildNormalizedResult(result, scenario);

    const page = {
      left: 18,
      right: 192,
      top: 20,
      bottom: 275,
      width: 174,
      lineHeight: 6,
    };

    const colors = {
      text: [20, 20, 20],
      muted: [100, 100, 100],
      border: [220, 220, 220],
      green: [34, 197, 94],
      yellow: [234, 179, 8],
      orange: [249, 115, 22],
      red: [220, 38, 38],
      blue: [37, 99, 235],
    };

    let y = page.top;

    const ensureSpace = (h = 12) => {
      if (y + h > page.bottom) {
        doc.addPage();
        y = page.top;
      }
    };

    const divider = () => {
      doc.setDrawColor(...colors.border);
      doc.line(page.left, y, page.right, y);
      y += 5;
    };

    const writeText = (text, options = {}) => {
      const {
        size = 10,
        style = "normal",
        color = colors.text,
        indent = 0,
        after = 3,
      } = options;

      const normalized = wrapSafeText(text);

      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.setTextColor(...color);

      const lines = doc.splitTextToSize(normalized, page.width - indent);
      const requiredHeight = lines.length * page.lineHeight + after;
      const maxContentHeight = page.bottom - page.top;

      if (requiredHeight <= maxContentHeight) {
        ensureSpace(requiredHeight);
      }

      lines.forEach((line) => {
        ensureSpace(page.lineHeight);
        doc.text(line, page.left + indent, y);
        y += page.lineHeight;
      });

      y += after;
    };

    const section = (title) => {
      ensureSpace(12);
      y += 4;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...colors.blue);
      doc.text(title, page.left, y);

      y += 4;
      divider();
    };

    const field = (label, value) => {
      const normalizedLabel = safeText(label);
      const normalizedValue = wrapSafeText(value);
      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      const labelText = `${normalizedLabel}: `;
      const labelWidth = doc.getTextWidth(labelText);
      const inlineWidth = Math.max(48, page.width - labelWidth);
      const valueWidth =
        normalizedLabel.toLowerCase() === "penalty"
          ? Math.min(inlineWidth, 108)
          : inlineWidth;
      const valueLines = doc.splitTextToSize(normalizedValue, valueWidth);
      const requiredHeight =
        Math.max(1, valueLines.length) * page.lineHeight + 4;

      ensureSpace(requiredHeight);

      doc.setTextColor(...colors.text);
      doc.text(labelText, page.left, y);

      doc.setFont("helvetica", "normal");
      doc.setFontSize(10);
      doc.setTextColor(...colors.muted);
      doc.text(valueLines[0], page.left + labelWidth, y);
      y += page.lineHeight;

      for (let index = 1; index < valueLines.length; index += 1) {
        ensureSpace(page.lineHeight + 1);
        doc.text(valueLines[index], page.left + labelWidth, y);
        y += page.lineHeight;
      }

      y += 2;
    };

    const list = (title, items) => {
      writeText(title, { style: "bold" });

      safeList(items).forEach((item) => {
        writeText("• " + item, { indent: 4, color: colors.muted });
      });
    };

    const severity = safeText(normalizedResult?.severity, "LOW");

    const severityColor =
      severity === "CRITICAL"
        ? colors.red
        : severity === "HIGH"
          ? colors.orange
          : severity === "MEDIUM"
            ? colors.yellow
            : colors.green;

    const insightConfidence = safeText(normalizedResult?.insights?.confidence, "LOW").toUpperCase();
    const confidenceColor = detectConfidenceColor(insightConfidence, colors);

    // HEADER
    doc.setFont("helvetica", "bold");
    doc.setFontSize(20);
    doc.text("BreachSense Report", page.left, y);

    y += 8;

    doc.setFontSize(14);
    doc.text(safeText(scenario.incidentTitle), page.left, y);

    y += 6;

    writeText("Cyber-Legal Incident Analysis", {
      size: 10,
      color: colors.muted,
    });

    // Severity Badge
    doc.setFillColor(...severityColor);
    doc.roundedRect(page.right - 50, page.top - 2, 45, 10, 3, 3, "F");

    doc.setTextColor(255, 255, 255);
    doc.setFontSize(9);
    doc.text(severity, page.right - 28, page.top + 4, { align: "center" });

    y += 10;

    // SECTION: OVERVIEW
    section("1. Incident Overview");
    field("System Type", scenario.system);
    field("Data Type", scenario.dataType);
    field("Category", scenario.category);
    field("Attack Vector", scenario.attackVector);

    // DESCRIPTION
    section("2. Description");
    writeText(scenario.description, { color: colors.muted });

    // BREACH
    section("3. Breach Analysis");
    field("Breach", normalizedResult.breach ? "Yes" : "No");
    field("Type", prettyLabel(normalizedResult.breach_type));
    field("Reason", normalizedResult.reason);

    // OWASP
    section("4. OWASP Mapping");
    field("Risk", normalizedResult.owasp?.risk);
    field("Node", normalizedResult.owasp?.node);

    // LEGAL
    section("5. Legal Analysis");
    list("IT Act", normalizedResult.legal?.it_act);
    list("DPDP", normalizedResult.legal?.dpdp);
    const normalizedPenalty = sanitizePenaltyText(normalizedResult.legal?.penalty);
    field("Penalty", normalizedPenalty);

    // INSIGHTS
    section("6. Strategic Insights");
    field("Executive Summary", normalizedResult?.insights?.executive_summary);
    field("Attack Narrative", normalizedResult?.insights?.attack_narrative);
    field("Business Impact", normalizedResult?.insights?.business_impact);
    field("Legal Exposure Summary", normalizedResult?.insights?.legal_exposure_summary);

    writeText("Confidence", { style: "bold", size: 10 });
    doc.setFillColor(...confidenceColor);
    doc.roundedRect(page.left + 4, y - 4.5, 28, 8, 2, 2, "F");
    doc.setTextColor(255, 255, 255);
    doc.setFont("helvetica", "bold");
    doc.setFontSize(8.5);
    doc.text(insightConfidence, page.left + 18, y + 0.9, { align: "center" });
    y += 8;

    list("Evidence Signals", normalizedResult?.insights?.evidence_signals);
    list("Priority Actions", normalizedResult?.insights?.priority_actions);

    // PREVENTION
    section("7. Prevention");
    list("Recommendations", normalizedResult.prevention);

    // DIAGRAM (always light theme)
    const lightDiagram = getLightDiagramImage();
    if (lightDiagram) {
      section("8. Diagram");
      ensureSpace(110);
      doc.addImage(lightDiagram, "PNG", page.left, y, page.width, 100);
      y += 105;
    }

    // FOOTER
    const totalPages = doc.getNumberOfPages();
    for (let i = 1; i <= totalPages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text(
        `Generated by BreachSense | Page ${i}/${totalPages}`,
        page.left,
        290,
      );
    }

    const fileName = safeText(scenario.incidentTitle)
      .replace(/\s+/g, "_")
      .slice(0, 40);

    doc.save(`BreachSense_${fileName}.pdf`);
  }

  return (
    <button
      onClick={downloadPdf}
      className="flex items-center gap-2 rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white transition hover:bg-neutral-800"
    >
      <FiDownload />
      Download Report
    </button>
  );
}
