"use client";

import { jsPDF } from "jspdf";
import { FiDownload } from "react-icons/fi";

/* ---------------- HELPERS ---------------- */

function safeText(value, fallback = "Not provided") {
  if (typeof value !== "string") return fallback;
  const v = value.replace(/\s+/g, " ").trim();
  return v || fallback;
}

function safeList(value, fallback = "Not specified") {
  if (!Array.isArray(value) || value.length === 0) return [fallback];
  return value.map((v) => safeText(v, fallback));
}

function sanitizePenaltyText(value) {
  if (typeof value !== "string") return "Not provided";
  return value.replace(/\s+/g, " ").trim();
}

function prettyLabel(value) {
  return safeText(value)
    .replace(/_/g, " ")
    .replace(/\b\w/g, (m) => m.toUpperCase());
}

/* ---------------- NORMALIZER ---------------- */

function buildNormalizedResult(result) {
  return {
    breach: result?.breach ?? true,
    breach_type: safeText(result?.breach_type, "unauthorized_access"),
    severity: safeText(result?.severity, "LOW"),
    reason: safeText(result?.reason),

    owasp: {
      risk: safeText(result?.owasp?.risk),
      node: safeText(result?.owasp?.node),
    },

    legal: {
      it_act: safeList(result?.legal?.india?.it_act),
      dpdp: safeList(result?.legal?.india?.dpdp),

      overall_penalty: sanitizePenaltyText(
        result?.legal?.overall_penalty || "Not specified",
      ),

      gdpr: {
        applicable: result?.legal?.international?.gdpr?.applicable ?? false,
        articles: safeList(result?.legal?.international?.gdpr?.articles),
        penalty: sanitizePenaltyText(
          result?.legal?.international?.gdpr?.penalty,
        ),
      },

      hipaa: {
        applicable: result?.legal?.international?.hipaa?.applicable ?? false,
        provisions: safeList(result?.legal?.international?.hipaa?.provisions),
        penalty: sanitizePenaltyText(
          result?.legal?.international?.hipaa?.penalty,
        ),
      },

      others: result?.legal?.international?.others || [],
    },

    prevention: safeList(result?.prevention),

    insights: {
      summary: safeText(result?.insights?.executive_summary),
      confidence: safeText(result?.insights?.confidence, "MEDIUM"),
    },
  };
}

/* ---------------- COMPONENT ---------------- */

export default function PdfReportButton({ result, scenario, diagramImage }) {
  if (!result || !scenario) return null;

  // ✅ FORCE LIGHT DIAGRAM
  function getLightDiagramImage() {
    if (typeof diagramImage === "function") {
      return diagramImage(false); // always light
    }
    return diagramImage;
  }

  function downloadPdf() {
    const doc = new jsPDF({ unit: "mm", format: "a4" });
    const data = buildNormalizedResult(result);

    const page = {
      left: 18,
      right: 192,
      top: 20,
      bottom: 275,
      width: 174,
      line: 6,
    };

    const colors = {
      text: [20, 20, 20],
      muted: [110, 110, 110],
      border: [220, 220, 220],
      blue: [37, 99, 235],
      green: [34, 197, 94],
      yellow: [234, 179, 8],
      orange: [249, 115, 22],
      red: [220, 38, 38],
    };

    let y = page.top;

    const ensure = (h = 10) => {
      if (y + h > page.bottom) {
        doc.addPage();
        y = page.top;
      }
    };

    const write = (text, size = 10, style = "normal", color = colors.text) => {
      doc.setFont("helvetica", style);
      doc.setFontSize(size);
      doc.setTextColor(...color);
      const lines = doc.splitTextToSize(text, page.width);
      lines.forEach((l) => {
        ensure();
        doc.text(l, page.left, y);
        y += page.line;
      });
      y += 2;
    };

    const section = (title) => {
      ensure(12);
      y += 6;
      doc.setFont("helvetica", "bold");
      doc.setFontSize(13);
      doc.setTextColor(...colors.blue);
      doc.text(title, page.left, y);
      y += 4;
      doc.setDrawColor(...colors.border);
      doc.line(page.left, y, page.right, y);
      y += 6;
    };

    const list = (title, arr) => {
      write(title, 11, "bold");
      arr.forEach((item) => write("• " + item, 10, "normal", colors.muted));
    };

    /* ---------------- HEADER ---------------- */

    doc.setFont("helvetica", "bold");
    doc.setFontSize(22);
    doc.setTextColor(...colors.blue);
    doc.text("BreachSense Report", page.left, y);

    y += 8;

    doc.setFontSize(14);
    doc.setTextColor(...colors.text);
    doc.text(safeText(scenario.incidentTitle), page.left, y);

    y += 10;

    /* ---------------- 🔥 RISK BAR ---------------- */

    const severity = data.severity.toUpperCase();

    const scoreMap = {
      LOW: 25,
      MEDIUM: 50,
      HIGH: 75,
      CRITICAL: 100,
    };

    const score = scoreMap[severity] || 25;

    const color =
      severity === "CRITICAL"
        ? colors.red
        : severity === "HIGH"
          ? colors.orange
          : severity === "MEDIUM"
            ? colors.yellow
            : colors.green;

    // Background
    doc.setFillColor(230, 230, 230);
    doc.roundedRect(page.left, y, 120, 8, 2, 2, "F");

    // Fill
    doc.setFillColor(...color);
    doc.roundedRect(page.left, y, (score / 100) * 120, 8, 2, 2, "F");

    doc.setFontSize(9);
    doc.setTextColor(...colors.text);
    doc.text(`Risk Level: ${severity}`, page.left + 125, y + 5);

    y += 15;

    /* ---------------- OVERVIEW ---------------- */

    section("1. Incident Overview");
    write(`System: ${scenario.system}`);
    write(`Data Type: ${scenario.dataType}`);
    write(`Category: ${scenario.category}`);
    write(`Attack Vector: ${scenario.attackVector}`);

    /* ---------------- BREACH ---------------- */

    section("2. Breach Analysis");
    write(`Breach: ${data.breach ? "Yes" : "No"}`);
    write(`Type: ${prettyLabel(data.breach_type)}`);
    write(`Reason: ${data.reason}`);

    /* ---------------- OWASP ---------------- */

    section("3. OWASP Mapping");
    write(`Risk: ${data.owasp.risk}`);
    write(`Node: ${data.owasp.node}`);

    /* ---------------- LEGAL ---------------- */

    section("4. Legal Analysis");

    write("India (IT Act & DPDP)", 11, "bold");
    list("IT Act Sections", data.legal.it_act);
    list("DPDP Violations", data.legal.dpdp);
    write(`Overall Penalty: ${data.legal.overall_penalty}`);

    write("GDPR (EU)", 11, "bold");
    if (data.legal.gdpr.applicable) {
      list("Articles", data.legal.gdpr.articles);
      write(`Penalty: ${data.legal.gdpr.penalty}`);
    } else {
      write("Not Applicable", 10, "normal", colors.muted);
    }

    write("HIPAA (US Healthcare)", 11, "bold");
    if (data.legal.hipaa.applicable) {
      list("Provisions", data.legal.hipaa.provisions);
      write(`Penalty: ${data.legal.hipaa.penalty}`);
    } else {
      write("Not Applicable", 10, "normal", colors.muted);
    }

    /* ---------------- INSIGHTS ---------------- */

    section("5. Insights");
    write(`Summary: ${data.insights.summary}`);
    write(`Confidence: ${data.insights.confidence}`);

    /* ---------------- PREVENTION ---------------- */

    section("6. Recommendations");
    data.prevention.forEach((p) => write("• " + p));

    /* ---------------- DIAGRAM ---------------- */

    const img = getLightDiagramImage();
    if (img) {
      section("7. System Diagram");
      ensure(110);
      doc.addImage(img, "PNG", page.left, y, page.width, 100);
      y += 105;
    }

    /* ---------------- FOOTER ---------------- */

    const pages = doc.getNumberOfPages();
    for (let i = 1; i <= pages; i++) {
      doc.setPage(i);
      doc.setFontSize(8);
      doc.setTextColor(...colors.muted);
      doc.text(`Generated by BreachSense | Page ${i}/${pages}`, page.left, 290);
    }

    doc.save("BreachSense_Report.pdf");
  }

  return (
    <button
      onClick={downloadPdf}
      className="flex items-center gap-2 rounded-lg bg-neutral-700 px-4 py-2 text-sm font-medium text-white hover:bg-neutral-800"
    >
      <FiDownload />
      Download Report
    </button>
  );
}
