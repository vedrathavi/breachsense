import { NextResponse } from "next/server";
import { buildAgentPrompt, extractJsonObject } from "@/lib/agentLogic";
import {
  normalizeInput,
  validateAgentOutput,
  validateInputPayload,
} from "@/lib/agentSchema";

const GEMINI_MODEL = process.env.GEMINI_MODEL || "gemini-2.5-flash";
const GENERIC_ERROR = { error: "Analysis failed. Please try again." };

async function callGemini(input) {
  const apiKey = process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error("GEMINI_API_KEY is not configured.");
  }

  const endpoint = `https://generativelanguage.googleapis.com/v1beta/models/${GEMINI_MODEL}:generateContent?key=${apiKey}`;
  const prompt = buildAgentPrompt(input);

  const response = await fetch(endpoint, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      contents: [{ role: "user", parts: [{ text: prompt }] }],
      generationConfig: {
        temperature: 0.2,
        responseMimeType: "application/json",
      },
    }),
    cache: "no-store",
  });

  if (!response.ok) {
    throw new Error(`Gemini API failed with status ${response.status}.`);
  }

  const payload = await response.json();
  const rawText = payload?.candidates?.[0]?.content?.parts?.[0]?.text;
  console.log("[Gemini raw output]", rawText);
  if (!rawText) {
    throw new Error("Gemini response did not include content.");
  }

  const parsed = extractJsonObject(rawText);
  console.log("[Gemini parsed output]", JSON.stringify(parsed, null, 2));
  if (!validateAgentOutput(parsed)) {
    throw new Error("Gemini output failed schema validation.");
  }

  return parsed;
}

export async function POST(request) {
  try {
    const body = await request.json();
    if (!validateInputPayload(body)) {
      return NextResponse.json(GENERIC_ERROR, { status: 400 });
    }

    const input = normalizeInput(body);
    const agentResult = await callGemini(input);
    console.log(
      "[API /api/agent response]",
      JSON.stringify(agentResult, null, 2),
    );
    return NextResponse.json(agentResult, { status: 200 });
  } catch (error) {
    console.error("/api/agent analysis error:", error);
    return NextResponse.json(GENERIC_ERROR, { status: 500 });
  }
}
