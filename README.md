# BreachSense: Threat Modeling & Incident Analysis Platform

#

**Live Demo:** https://breachsense.vercel.app/

## What is BreachSense?

BreachSense is an automated threat modeling and incident analysis platform. It helps security, compliance, and legal teams analyze cyber incidents, map threats, and generate actionable, legally-aware reports for Indian and international regulatory requirements (including GDPR, HIPAA, and more).

## Why use BreachSense?

- **Automate incident analysis:** Get instant, structured breach assessments and legal mappings for real-world scenarios.
- **Visualize threats:** See how attacks propagate through your system architecture and where risks concentrate.
- **Generate compliance-ready reports:** Export PDF reports with all findings, including legal exposure and prevention steps.

## Who should use it?

- Security analysts and incident responders
- Compliance and legal teams (especially in India)
- CISOs, risk managers, and auditors
- Anyone needing fast, structured cyber incident analysis and reporting

## When should you use it?

- After a real or simulated security incident
- During tabletop exercises or risk assessments
- For compliance documentation and audit preparation
- When you need to communicate risk and legal exposure to stakeholders

## How does it work?

1. **Input:** Fill out the incident scenario form (system, data type, breach category, severity, etc.)
2. **Analysis:** The backend uses an LLM to classify the breach, map OWASP risks, analyze legal exposure (IT Act, DPDP), and generate prevention steps and insights.
3. **Visualization:** The dashboard displays a threat model diagram showing system nodes, attack paths, and overlays for risks and compromised elements.
4. **Reporting:** Download a PDF report with all findings, including a labeled diagram and legal analysis.

## Core Features & Flow

- **Incident Analysis API:** POST to `/api/agent` with scenario details, receive structured JSON with breach type, severity, OWASP mapping, legal analysis, prevention, and insights.
- **Interactive Dashboard:** Input scenarios, view results, and interact with the threat model diagram.
- **PDF Export:** Download a compliance-ready report with all findings and a labeled diagram. Now includes improved formatting and more detailed legal/technical sections.
- **Legal Mapping (Enhanced):** Maps Indian IT Act 2000, DPDP, and international laws (GDPR, HIPAA, etc.) for each scenario, with detailed section/provision breakdowns and penalty estimation.
- **Severity Badges:** Visual severity indicators throughout the dashboard and reports for quick risk assessment.
- **Detailed Results Panel:** Expanded legal analysis, including international law applicability, OWASP mapping, affected components, and prioritized prevention steps.
- **Advanced System Diagram:** Dynamic, multi-layered threat model visualization with support for multiple system types and attack vectors.
- **Actionable Prevention:** Get 3-5 prioritized prevention steps for each incident, tailored to scenario specifics.

## Setup & Usage

1. Clone the repo and install dependencies:
   ```bash
   git clone https://github.com/vedrathavi/breachsense.git
   cd breachsense
   npm install
   # or yarn install
   ```
2. Add your Gemini API key to `.env.local`:
   ```
   GEMINI_API_KEY=your_google_gemini_api_key
   ```
3. Start the development server:
   ```bash
   npm run dev
   # or yarn dev
   ```
4. Open [http://localhost:3000](http://localhost:3000) and use the dashboard.

## Example API Usage

POST to `/api/agent` with:

```json
{
  "system": "Hospital / Healthcare System",
  "dataType": "Health Records",
  "dataVolume": "High (thousands+)",
  "category": "Data Leak / Exposure",
  "severityHint": "HIGH",
  "attackVector": "Misconfigured Server",
  "affectedUsers": "Large Population",
  "dataExposure": "Full Exposure",
  "detectionTime": "Delayed",
  "description": "A public storage bucket exposed patient diagnostic records and insurance details for several days before detection."
}
```

Response:

```json
{
  "breach": true,
  "breach_type": "data_leak",
  "severity": "HIGH",
  "owasp": { "risk": "Broken Access Control", "node": "auth" },
  "legal": {
    "it_act": ["Section 43A"],
    "dpdp": ["Failure of security safeguards"],
    "penalty": "..."
  },
  "prevention": ["..."],
  "insights": {
    "executive_summary": "...",
    "attack_narrative": "...",
    "business_impact": "...",
    "legal_exposure_summary": "...",
    "confidence": "HIGH",
    "evidence_signals": ["..."],
    "priority_actions": ["..."]
  },
  "reason": "..."
}
```

## API Testing: `/api/agent`

Run the app first:

```bash
npm run dev
```

Endpoint:

- `POST http://localhost:3000/api/agent`

Required JSON body keys:

- `system`
- `dataType`
- `dataVolume`
- `category`
- `severityHint`
- `attackVector`
- `affectedUsers`
- `dataExposure`
- `detectionTime`
- `description`

### 1) Hospital + Sensitive Data + Data Leak

```bash
curl -X POST http://localhost:3000/api/agent \
	-H "Content-Type: application/json" \
	-d '{
		"system": "Hospital / Healthcare System",
		"dataType": "Health Records",
		"dataVolume": "High (thousands+)",
		"category": "Data Leak / Exposure",
		"severityHint": "HIGH",
		"attackVector": "Misconfigured Server",
		"affectedUsers": "Large Population",
		"dataExposure": "Full Exposure",
		"detectionTime": "Delayed",
		"description": "A public storage bucket exposed patient diagnostic records and insurance details for several days before detection."
	}'
```

### 2) Bank + Unauthorized Access

```bash
curl -X POST http://localhost:3000/api/agent \
	-H "Content-Type: application/json" \
	-d '{
		"system": "Banking / Financial System",
		"dataType": "Financial Data",
		"dataVolume": "Medium (hundreds)",
		"category": "Unauthorized Access",
		"severityHint": "CRITICAL",
		"attackVector": "Credential Theft",
		"affectedUsers": "Multiple Users",
		"dataExposure": "Partial Exposure",
		"detectionTime": "Immediate",
		"description": "Compromised employee credentials were used to access customer account dashboards and export transaction statements."
	}'
```

### 3) Government + Insider Misuse

```bash
curl -X POST http://localhost:3000/api/agent \
	-H "Content-Type: application/json" \
	-d '{
		"system": "Government Database",
		"dataType": "Sensitive Personal Data",
		"dataVolume": "High (thousands+)",
		"category": "Insider Misuse",
		"severityHint": "HIGH",
		"attackVector": "Unknown",
		"affectedUsers": "Large Population",
		"dataExposure": "Partial Exposure",
		"detectionTime": "Delayed",
		"description": "An internal operator extracted citizen identity data outside approved workflows and shared it with unauthorized third parties."
	}'
```

Expected success shape:

```json
{
  "breach": true,
  "breach_type": "unauthorized_access",
  "severity": "HIGH",
  "owasp": {
    "risk": "Broken Access Control",
    "node": "auth"
  },
  "legal": {
    "india": {
      "it_act": ["Section 43A"],
      "dpdp": ["Failure of security safeguards"]
    },
    "international": {
      "gdpr": {
        "applicable": false,
        "articles": [],
        "penalty": ""
      },
      "hipaa": {
        "applicable": false,
        "provisions": [],
        "penalty": ""
      },
      "others": []
    },
    "overall_penalty": "Estimated combined exposure may exceed ₹40–80 crore, considering DPDP penalties, GDPR administrative fines, and civil liabilities."
  },
  "prevention": [
    "Enable MFA for all privileged accounts",
    "Enforce least-privilege access",
    "Encrypt sensitive data at rest and in transit"
  ],
  "reason": "Credential compromise and abnormal access pattern indicate unauthorized access."
}
```

Error shape:

```json
{
  "error": "Analysis failed. Please try again."
}
```

## Threat Modeling and Visualization

### 1. Introduction

The system uses a graph-based threat modeling approach to represent system architecture and attack propagation paths.

### 2. Modeling Approach

System components are modeled as nodes, data flows are modeled as directed edges, and threats are represented as overlays on top of architecture flow.

### 3. Diagram Structure

- Multi-layer architecture with trust zones (External, Application, Secure)
- Branching flows between frontend, API/backend services, auth services, and data stores
- Multiple attack vectors shown simultaneously as threat edges

### 4. Notation Used

The diagram follows Data Flow Diagram (DFD) conventions combined with OWASP threat modeling principles. See the legend and notation sections in the UI for a visual guide.

| Element         | Standard                |
| --------------- | ----------------------- |
| External Entity | Circle                  |
| Process         | Rectangle               |
| Data Store      | Cylinder                |
| Sensitive Data  | Double-border Rectangle |
| Data Flow       | Arrow                   |
| Trust Boundary  | Box                     |

### 5. Threat Representation

- Red/Orange attack edges indicate active or potential attack paths
- Highlighted nodes indicate compromised or high-risk components
- OWASP labels identify threat context near impacted nodes
- PDF export always uses a light-themed diagram and includes a label describing the diagram's purpose

### 6. Interpretation

Example interpretation:

"The diagram shows that the attacker exploited authentication weakness and reached backend services, resulting in exposure risk for sensitive records in the database zone."
