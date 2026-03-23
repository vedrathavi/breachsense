"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import cytoscape from "cytoscape";
import {
  FiAlertTriangle,
  FiArrowRight,
  FiDatabase,
  FiLayers,
  FiLock,
  FiShield,
  FiTarget,
} from "react-icons/fi";
import { getSeverityVisuals } from "@/lib/severityTheme";

const architectureBySystem = {
  "Hospital / Healthcare System": {
    nodes: [
      { id: "user", label: "User", type: "user", zone: "external" },
      { id: "frontend", label: "Frontend", type: "frontend", zone: "internal" },
      {
        id: "api-gateway",
        label: "API Gateway",
        type: "process",
        zone: "internal",
      },
      { id: "backend", label: "Backend", type: "process", zone: "internal" },
      { id: "auth", label: "Auth Server", type: "auth", zone: "internal" },
      {
        id: "token-service",
        label: "Token Service",
        type: "auth",
        zone: "internal",
      },
      { id: "database", label: "Database", type: "datastore", zone: "secure" },
      {
        id: "sensitive-store",
        label: "Health Records",
        type: "sensitive",
        zone: "secure",
      },
    ],
    edges: [
      ["user", "frontend", "Login Request"],
      ["user", "api-gateway", "API Request"],
      ["frontend", "backend", "App Request"],
      ["api-gateway", "backend", "Service Route"],
      ["backend", "auth", "Credential Validation"],
      ["auth", "token-service", "Token Exchange"],
      ["backend", "database", "Data Query"],
      ["database", "sensitive-store", "Records Access"],
    ],
  },
  "Banking / Financial System": {
    nodes: [
      { id: "user", label: "User", type: "user", zone: "external" },
      { id: "frontend", label: "Frontend", type: "frontend", zone: "internal" },
      {
        id: "api-gateway",
        label: "API Gateway",
        type: "process",
        zone: "internal",
      },
      { id: "backend", label: "Backend", type: "process", zone: "internal" },
      { id: "auth", label: "Auth Server", type: "auth", zone: "internal" },
      {
        id: "token-service",
        label: "Token Service",
        type: "auth",
        zone: "internal",
      },
      {
        id: "payment-gateway",
        label: "Payment Gateway",
        type: "process",
        zone: "internal",
      },
      { id: "database", label: "Database", type: "datastore", zone: "secure" },
    ],
    edges: [
      ["user", "frontend", "Login Request"],
      ["user", "api-gateway", "Direct API Call"],
      ["frontend", "backend", "App Request"],
      ["api-gateway", "backend", "Service Route"],
      ["backend", "auth", "Credential Validation"],
      ["auth", "token-service", "Token Exchange"],
      ["backend", "payment-gateway", "Payment Processing"],
      ["payment-gateway", "database", "Transaction Write"],
      ["backend", "database", "Account Query"],
    ],
  },
  "E-commerce Platform": {
    nodes: [
      { id: "user", label: "User", type: "user", zone: "external" },
      { id: "frontend", label: "Frontend", type: "frontend", zone: "internal" },
      {
        id: "api-gateway",
        label: "API Gateway",
        type: "process",
        zone: "internal",
      },
      { id: "backend", label: "Backend", type: "process", zone: "internal" },
      { id: "auth", label: "Auth Server", type: "auth", zone: "internal" },
      {
        id: "token-service",
        label: "Token Service",
        type: "auth",
        zone: "internal",
      },
      {
        id: "order-service",
        label: "Order Service",
        type: "process",
        zone: "internal",
      },
      { id: "database", label: "Database", type: "datastore", zone: "secure" },
      {
        id: "sensitive-store",
        label: "Customer PII",
        type: "sensitive",
        zone: "secure",
      },
    ],
    edges: [
      ["user", "frontend", "Checkout Request"],
      ["user", "api-gateway", "API Request"],
      ["frontend", "backend", "Catalog Request"],
      ["api-gateway", "backend", "Service Route"],
      ["backend", "auth", "Credential Validation"],
      ["auth", "token-service", "Token Exchange"],
      ["backend", "order-service", "Order Workflow"],
      ["order-service", "database", "Order Write"],
      ["database", "sensitive-store", "PII Access"],
    ],
  },
  "Government Database": {
    nodes: [
      { id: "user", label: "User", type: "user", zone: "external" },
      { id: "portal", label: "Portal", type: "frontend", zone: "internal" },
      { id: "backend", label: "Backend", type: "process", zone: "internal" },
      {
        id: "identity-service",
        label: "Identity Service",
        type: "auth",
        zone: "internal",
      },
      {
        id: "token-service",
        label: "Token Service",
        type: "auth",
        zone: "internal",
      },
      { id: "database", label: "Database", type: "datastore", zone: "secure" },
      {
        id: "sensitive-store",
        label: "Citizen Records",
        type: "sensitive",
        zone: "secure",
      },
    ],
    edges: [
      ["user", "portal", "Citizen Request"],
      ["portal", "backend", "Portal API"],
      ["backend", "identity-service", "Identity Validation"],
      ["identity-service", "token-service", "Token Exchange"],
      ["backend", "database", "Record Query"],
      ["database", "sensitive-store", "PII Access"],
    ],
  },
  "Cloud Service Provider": {
    nodes: [
      { id: "user", label: "User", type: "user", zone: "external" },
      { id: "frontend", label: "Frontend", type: "frontend", zone: "internal" },
      {
        id: "api-gateway",
        label: "API Gateway",
        type: "process",
        zone: "internal",
      },
      {
        id: "microservices",
        label: "Microservices",
        type: "process",
        zone: "internal",
      },
      { id: "auth", label: "Auth Server", type: "auth", zone: "internal" },
      {
        id: "token-service",
        label: "Token Service",
        type: "auth",
        zone: "internal",
      },
      { id: "database", label: "Database", type: "datastore", zone: "secure" },
      {
        id: "sensitive-store",
        label: "Sensitive Data",
        type: "sensitive",
        zone: "secure",
      },
    ],
    edges: [
      ["user", "frontend", "Console Request"],
      ["user", "api-gateway", "API Request"],
      ["frontend", "api-gateway", "Gateway Call"],
      ["api-gateway", "microservices", "Service Route"],
      ["microservices", "auth", "Credential Validation"],
      ["auth", "token-service", "Token Exchange"],
      ["microservices", "database", "Data Access"],
      ["database", "sensitive-store", "Sensitive Read"],
    ],
  },
};

function getNodeTheme(type, isDark) {
  if (type === "user")
    return {
      bg: isDark ? "#64748b" : "#94a3b8",
      text: "#ffffff",
      shape: "ellipse",
    };
  if (type === "frontend")
    return {
      bg: isDark ? "#3b82f6" : "#2563eb",
      text: "#ffffff",
      shape: "rectangle",
    };
  if (type === "process")
    return {
      bg: isDark ? "#8b5cf6" : "#7c3aed",
      text: "#ffffff",
      shape: "rectangle",
    };
  if (type === "auth")
    return {
      bg: isDark ? "#fb923c" : "#ea580c",
      text: "#ffffff",
      shape: "round-rectangle",
    };
  if (type === "datastore")
    return {
      bg: isDark ? "#60a5fa" : "#1e3a8a",
      text: "#ffffff",
      shape: "barrel",
    };
  return {
    bg: isDark ? "#f87171" : "#b91c1c",
    text: "#ffffff",
    shape: "rectangle",
  };
}

function mapTargetNode(requestedNode, nodes) {
  if (nodes.some((node) => node.id === requestedNode)) return requestedNode;

  const aliasMap = {
    frontend: ["frontend", "portal"],
    backend: ["backend", "api-gateway", "microservices"],
    auth: ["auth", "identity-service", "token-service"],
    database: ["database", "sensitive-store"],
  };

  const aliases = aliasMap[requestedNode] || [];
  const matched = aliases.find((id) => nodes.some((node) => node.id === id));
  if (matched) return matched;

  return nodes.find((node) => node.type === "datastore")?.id || nodes[0]?.id;
}

function buildArchitecture(systemType) {
  const template =
    architectureBySystem[systemType] ||
    architectureBySystem["Hospital / Healthcare System"];
  return {
    nodes: template.nodes,
    edges: template.edges.map((edge, index) => ({
      id: `flow-${index}`,
      source: edge[0],
      target: edge[1],
      label: edge[2],
    })),
  };
}

function buildNodePositions(nodes) {
  const zoneX = {
    external: 120,
    internal: 430,
    secure: 760,
  };

  const positions = {};

  nodes.forEach((node) => {
    let x = zoneX[node.zone] || 430;
    let y = 260;

    if (node.id === "user") {
      y = 260;
    } else if (["frontend", "portal"].includes(node.id)) {
      y = 190;
      x = zoneX.internal - 120;
    } else if (
      [
        "api-gateway",
        "backend",
        "microservices",
        "order-service",
        "payment-gateway",
      ].includes(node.id)
    ) {
      y = 285;
      if (node.id === "api-gateway") x = zoneX.internal - 30;
      if (node.id === "backend") x = zoneX.internal + 60;
      if (node.id === "microservices") x = zoneX.internal + 140;
      if (node.id === "order-service") x = zoneX.internal + 160;
      if (node.id === "payment-gateway") x = zoneX.internal + 180;
    } else if (
      ["auth", "identity-service", "token-service"].includes(node.id)
    ) {
      y = 120;
      if (node.id === "auth") x = zoneX.internal + 95;
      if (node.id === "identity-service") x = zoneX.internal + 45;
      if (node.id === "token-service") x = zoneX.internal + 230;
    } else if (node.id === "database") {
      y = 265;
      x = zoneX.secure - 35;
    } else if (node.id === "sensitive-store") {
      y = 265;
      x = zoneX.secure + 110;
    }

    positions[node.id] = { x, y };
  });

  return positions;
}

function buildAttackPaths(architecture, targetNode, risk) {
  const has = (id) => architecture.nodes.some((node) => node.id === id);
  const backendLike = ["backend", "api-gateway", "microservices"].find(
    (nodeId) => has(nodeId),
  );
  const authLike = ["auth", "identity-service"].find((nodeId) => has(nodeId));
  const databaseLike = ["database", "sensitive-store"].find((nodeId) =>
    has(nodeId),
  );

  const paths = [];

  if (authLike) {
    paths.push({
      id: "threat-1",
      source: "user",
      target: authLike,
      label: `Broken Authentication (${risk})`,
      className: "attack-flow-1",
    });
  }

  if (backendLike) {
    paths.push({
      id: "threat-2",
      source: "user",
      target: backendLike,
      label: "API Exploit",
      className: "attack-flow-2",
    });
  }

  if (backendLike && databaseLike) {
    paths.push({
      id: "threat-3",
      source: backendLike,
      target: databaseLike,
      label: "Data Leak Propagation",
      className: "attack-flow-3",
    });
  }

  if (targetNode && has(targetNode) && targetNode !== "user") {
    paths.push({
      id: "threat-focus",
      source: backendLike || "user",
      target: targetNode,
      label: "Primary Impact",
      className: "attack-flow-focus",
    });
  }

  return paths.filter((path) => has(path.source) && has(path.target));
}

export default function SystemDiagram({
  systemType,
  result,
  incidentTitle,
  onSnapshotChange,
  isDark = false,
}) {
  const containerRef = useRef(null);
  const cyRef = useRef(null);
  const [tooltip, setTooltip] = useState(null);

  const severity = result?.severity || "LOW";
  const architecture = useMemo(
    () => buildArchitecture(systemType),
    [systemType],
  );

  useEffect(() => {
    if (!containerRef.current) return;
    const visuals = getSeverityVisuals(severity, isDark);

    const targetNode = mapTargetNode(
      result?.owasp?.node || "backend",
      architecture.nodes,
    );
    const attackPaths = buildAttackPaths(
      architecture,
      targetNode,
      result?.owasp?.risk || "OWASP Risk",
    );
    const nodePositions = buildNodePositions(architecture.nodes);

    const zoneParents = [
      {
        data: { id: "external-zone", label: "External Zone" },
        classes: "boundary-external",
      },
      {
        data: { id: "internal-zone", label: "Application Zone" },
        classes: "boundary-internal",
      },
      {
        data: { id: "secure-zone", label: "Secure Zone" },
        classes: "boundary-secure",
      },
    ];

    const nodes = architecture.nodes.map((node) => {
      const theme = getNodeTheme(node.type, isDark);
      const isTarget = node.id === targetNode;
      const riskLevel = isTarget ? visuals.severity : "NORMAL";

      return {
        data: {
          id: node.id,
          label: node.label,
          parent: `${node.zone}-zone`,
          risk: riskLevel,
          owaspRisk: result?.owasp?.risk || "No mapped risk",
          component: node.label,
          nodeColor: isTarget ? visuals.nodeColor : theme.bg,
          nodeText: theme.text,
          nodeShape: theme.shape,
        },
        classes: `${isTarget ? "threat-node" : ""} ${node.type === "sensitive" ? "sensitive-node" : ""}`,
      };
    });

    const edges = architecture.edges.map((edge) => ({
      data: {
        id: edge.id,
        source: edge.source,
        target: edge.target,
        label: edge.label,
      },
    }));

    const threatEdges = attackPaths.map((path) => ({
      data: {
        id: path.id,
        source: path.source,
        target: path.target,
        label: path.label,
      },
      classes: path.className,
    }));

    const cy = cytoscape({
      container: containerRef.current,
      elements: [...zoneParents, ...nodes, ...edges, ...threatEdges],
      userPanningEnabled: true,
      userZoomingEnabled: true,
      zoomingEnabled: true,
      panningEnabled: true,
      autoungrabify: false,
      autolock: false,
      minZoom: 0.35,
      maxZoom: 2.25,
      style: [
        {
          selector: "node",
          style: {
            label: "data(label)",
            "background-color": "data(nodeColor)",
            shape: "data(nodeShape)",
            color: "data(nodeText)",
            "text-valign": "center",
            "text-halign": "center",
            width: 64,
            height: 64,
            "font-size": 9,
            "font-weight": 700,
            "text-wrap": "wrap",
            "text-max-width": "70px",
            "border-width": 1.5,
            "border-color": isDark ? "#374151" : "#e5e7eb",
          },
        },
        {
          selector: "edge",
          style: {
            width: 2,
            "line-color": isDark ? "#94a3b8" : "#64748b",
            "target-arrow-color": isDark ? "#94a3b8" : "#64748b",
            "target-arrow-shape": "triangle",
            "curve-style": "bezier",
            "control-point-step-size": 45,
            label: "data(label)",
            "font-size": 7,
            color: isDark ? "#d1d5db" : "#334155",
            "text-background-color": isDark ? "#111827" : "#ffffff",
            "text-background-opacity": 0.9,
            "text-background-padding": 2,
            "text-margin-y": -7,
            "text-rotation": "autorotate",
            "arrow-scale": 1.1,
          },
        },
        {
          selector: ".threat-node",
          style: {
            width:
              visuals.severity === "CRITICAL"
                ? 84
                : visuals.severity === "HIGH"
                  ? 80
                  : 76,
            height:
              visuals.severity === "CRITICAL"
                ? 84
                : visuals.severity === "HIGH"
                  ? 80
                  : 76,
            "border-width":
              visuals.severity === "HIGH" || visuals.severity === "CRITICAL"
                ? 5
                : 4,
            "border-color": isDark ? "#fda4af" : "#fecaca",
            "shadow-color": visuals.nodeColor,
            "shadow-blur": visuals.glow,
            "shadow-opacity": 0.8,
            "z-index": 999,
          },
        },
        {
          selector: ".sensitive-node",
          style: {
            "border-style": "double",
            "border-width": 4,
          },
        },
        {
          selector: ".owasp-tag-node",
          style: {
            shape: "round-rectangle",
            width: "label",
            height: "label",
            padding: "6px",
            label: "data(label)",
            "font-size": 9,
            "font-weight": 700,
            "background-color": isDark ? "#3f1d1d" : "#fee2e2",
            color: isDark ? "#fecaca" : "#7f1d1d",
            "border-color": visuals.edgeColor,
            "border-width": 1,
            "text-wrap": "wrap",
            "text-max-width": "140px",
          },
        },
        {
          selector: ".boundary-external, .boundary-internal, .boundary-secure",
          style: {
            label: "data(label)",
            "text-valign": "top",
            "text-halign": "center",
            "font-size": 10,
            "font-weight": 700,
            color: isDark ? "#d1d5db" : "#334155",
            shape: "round-rectangle",
            "background-opacity": 0.12,
            "border-width": 2,
            "border-style": "dashed",
            padding: "20px",
          },
        },
        {
          selector: ".boundary-external",
          style: {
            "background-color": isDark ? "#334155" : "#cbd5e1",
            "border-color": isDark ? "#94a3b8" : "#94a3b8",
          },
        },
        {
          selector: ".boundary-internal",
          style: {
            "background-color": isDark ? "#1e3a8a" : "#bfdbfe",
            "border-color": isDark ? "#60a5fa" : "#60a5fa",
          },
        },
        {
          selector: ".boundary-secure",
          style: {
            "background-color": isDark ? "#854d0e" : "#fde68a",
            "border-color": isDark ? "#fbbf24" : "#f59e0b",
          },
        },
        {
          selector:
            ".attack-flow-1, .attack-flow-2, .attack-flow-3, .attack-flow-focus",
          style: {
            width: visuals.edgeWidth,
            "line-style": "dashed",
            "line-color": visuals.edgeColor,
            "target-arrow-color": visuals.edgeColor,
            color: isDark ? "#f3f4f6" : "#7f1d1d",
            "font-weight": 700,
            "z-compound-depth": "top",
            "shadow-blur": visuals.glow,
            "shadow-color": visuals.edgeColor,
          },
        },
        {
          selector: ".attack-flow-focus",
          style: {
            width: visuals.edgeWidth + 1,
            "line-style": "solid",
          },
        },
      ],
      layout: {
        name: "preset",
        fit: true,
        padding: 30,
        positions: (node) => nodePositions[node.id()] || { x: 430, y: 260 },
      },
    });

    cyRef.current = cy;
    cy.nodes().unlock();

    let snapshotDebounce;
    const emitSnapshot = () => {
      if (!cyRef.current || typeof onSnapshotChange !== "function") return;
      const pngData = cyRef.current.png({
        full: true,
        scale: 2,
        bg: isDark ? "#111827" : "#ffffff",
      });
      onSnapshotChange(pngData);
    };

    const scheduleSnapshot = (delay = 180) => {
      clearTimeout(snapshotDebounce);
      snapshotDebounce = setTimeout(emitSnapshot, delay);
    };

    const targetElement = cy.getElementById(targetNode);
    if (targetElement && !targetElement.empty()) {
      const pos = targetElement.position();
      cy.add({
        data: {
          id: "owasp-tag",
          label: `OWASP: ${result?.owasp?.risk || "Threat"}`,
        },
        position: { x: pos.x + 110, y: pos.y - 35 },
        classes: "owasp-tag-node",
      });
    }

    let pulse = false;
    const pulseInterval = setInterval(
      () => {
        pulse = !pulse;
        const target = cy.getElementById(targetNode);
        if (!target || target.empty()) return;

        const baseSize =
          visuals.severity === "CRITICAL"
            ? 84
            : visuals.severity === "HIGH"
              ? 80
              : 76;
        target.style("shadow-opacity", pulse ? 0.95 : 0.55);
        target.style("width", pulse ? baseSize + 4 : baseSize);
        target.style("height", pulse ? baseSize + 4 : baseSize);

        cy.$(
          ".attack-flow-1, .attack-flow-2, .attack-flow-3, .attack-flow-focus",
        ).style(
          "line-color",
          pulse ? visuals.edgeColor : isDark ? "#fca5a5" : "#fb7185",
        );
        cy.$(
          ".attack-flow-1, .attack-flow-2, .attack-flow-3, .attack-flow-focus",
        ).style(
          "target-arrow-color",
          pulse ? visuals.edgeColor : isDark ? "#fca5a5" : "#fb7185",
        );
      },
      visuals.severity === "CRITICAL"
        ? 600
        : visuals.severity === "HIGH"
          ? 750
          : 900,
    );

    cy.on("mouseover", "node", (event) => {
      const node = event.target;
      if (node.isParent()) return;
      const point = event.renderedPosition;
      setTooltip({
        x: point.x,
        y: point.y,
        title: node.data("component"),
        risk: node.data("risk"),
        owasp: node.data("owaspRisk"),
      });
    });

    cy.on("mousemove", "node", (event) => {
      const point = event.renderedPosition;
      setTooltip((prev) => (prev ? { ...prev, x: point.x, y: point.y } : prev));
    });

    cy.on("mouseout", "node", () => {
      setTooltip(null);
    });

    cy.on("dragfree", "node", () => scheduleSnapshot(120));
    cy.on("zoom pan", () => scheduleSnapshot(220));
    cy.on("mouseup", () => scheduleSnapshot(120));

    cy.fit(cy.elements(), 28);
    scheduleSnapshot(260);

    return () => {
      clearTimeout(snapshotDebounce);
      clearInterval(pulseInterval);
      setTooltip(null);
      cy.destroy();
    };
  }, [architecture, result, severity, isDark, onSnapshotChange]);

  function exportDiagram() {
    if (!cyRef.current) return;
    const pngData = cyRef.current.png({
      full: true,
      scale: 2,
      bg: isDark ? "#111827" : "#ffffff",
    });
    if (typeof onSnapshotChange === "function") {
      onSnapshotChange(pngData);
    }
    const link = document.createElement("a");
    link.href = pngData;
    const safeTitle = (incidentTitle || "incident")
      .replace(/[^a-z0-9\-_ ]/gi, "")
      .trim()
      .replace(/\s+/g, "_")
      .slice(0, 50);
    link.download = `BreachSense_ThreatModel_${safeTitle || "incident"}.png`;
    link.click();
  }

  return (
    <section
      className={`rounded-xl border p-4 shadow-sm transition-colors ${
        isDark
          ? "border-neutral-800 bg-neutral-900"
          : "border-neutral-200 bg-white"
      }`}
    >
      <div className="mb-3 flex items-center justify-between gap-3">
        <div>
          <h2
            className={`text-lg font-semibold ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
          >
            {incidentTitle
              ? `Threat Model: ${incidentTitle}`
              : "Threat Model Diagram"}
          </h2>
          <p
            className={`text-xs ${isDark ? "text-neutral-400" : "text-neutral-600"}`}
          >
            Architecture + threat overlay inspired by OWASP Threat Dragon
            concepts.
          </p>
        </div>
        <button
          type="button"
          onClick={exportDiagram}
          className={`rounded-lg border px-3 py-1.5 text-xs font-medium ${
            isDark
              ? "border-neutral-800 bg-neutral-900 text-neutral-100 hover:bg-neutral-800"
              : "border-neutral-200 bg-neutral-50 text-neutral-900 hover:bg-neutral-100"
          }`}
        >
          Export PNG
        </button>
      </div>

      <div className="relative">
        <div
          ref={containerRef}
          className={`h-[520px] w-full rounded-lg border ${
            isDark
              ? "border-neutral-800 bg-neutral-950"
              : "border-neutral-200 bg-white"
          }`}
        />
        {tooltip ? (
          <div
            className={`pointer-events-none absolute z-10 max-w-56 rounded-md border p-2 text-xs shadow ${
              isDark
                ? "border-neutral-800 bg-neutral-950 text-neutral-100"
                : "border-neutral-200 bg-neutral-50 text-neutral-800"
            }`}
            style={{ left: tooltip.x + 14, top: tooltip.y + 14 }}
          >
            <p className="font-semibold">{tooltip.title}</p>
            <p className="mt-1">Risk Level: {tooltip.risk}</p>
            <p>OWASP: {tooltip.owasp}</p>
          </div>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 text-xs md:grid-cols-3">
        <div
          className={`rounded-md border p-2 ${isDark ? "border-neutral-800 bg-neutral-950 text-neutral-300" : "border-neutral-200 bg-neutral-50 text-neutral-700"}`}
        >
          <p
            className={`inline-flex items-center gap-1 font-semibold ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
          >
            <FiLayers className="h-3.5 w-3.5" /> Legend
          </p>
          <ul className="mt-1 space-y-1">
            <li className="inline-flex items-center gap-1">
              <FiTarget className="h-3.5 w-3.5" /> Compromised Node
            </li>
            <li className="inline-flex items-center gap-1">
              <FiShield className="h-3.5 w-3.5" /> Severity-tinted Overlay
            </li>
            <li className="inline-flex items-center gap-1">
              <FiArrowRight className="h-3.5 w-3.5" /> Branching Data/Attack
              Flows
            </li>
          </ul>
        </div>

        <div
          className={`rounded-md border p-2 ${isDark ? "border-neutral-800 bg-neutral-950 text-gray-300" : "border-gray-200 bg-gray-50 text-gray-700"}`}
        >
          <p
            className={`inline-flex items-center gap-1 font-semibold ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
          >
            <FiDatabase className="h-3.5 w-3.5" /> Notation
          </p>
          <ul className="mt-1 space-y-1">
            <li>Circle = External Entity</li>
            <li>Rectangle = Process</li>
            <li>Cylinder = Data Store</li>
            <li>Double-border Rectangle = Sensitive Data</li>
          </ul>
        </div>

        <div
          className={`rounded-md border p-2 ${isDark ? "border-neutral-800 bg-neutral-950 text-neutral-300" : "border-neutral-200 bg-neutral-50 text-neutral-700"}`}
        >
          <p
            className={`inline-flex items-center gap-1 font-semibold ${isDark ? "text-neutral-100" : "text-neutral-900"}`}
          >
            <FiLock className="h-3.5 w-3.5" /> Threat Context
          </p>
          <ul className="mt-1 space-y-1">
            <li className="inline-flex items-center gap-1">
              <FiAlertTriangle className="h-3.5 w-3.5" /> OWASP risk tag at
              impacted node
            </li>
            <li>External / Application / Secure boundaries</li>
            <li>Severity-driven edge width and glow</li>
          </ul>
        </div>
      </div>
    </section>
  );
}
