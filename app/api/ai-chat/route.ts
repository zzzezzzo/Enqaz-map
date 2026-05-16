import { NextRequest, NextResponse } from "next/server";

type ChatMessage = {
  role: "user" | "assistant";
  content: string;
};

/** Default local AI service (POST JSON: { message, lat, lon }). */
const DEFAULT_ASK_URL = "http://127.0.0.1:8001/ask";

function lastUserMessage(messages: ChatMessage[]): string | null {
  for (let i = messages.length - 1; i >= 0; i--) {
    const m = messages[i];
    if (m?.role === "user" && typeof m.content === "string" && m.content.trim()) {
      return m.content.trim();
    }
  }
  return null;
}

function parseAskReply(raw: unknown): string | null {
  if (typeof raw === "string" && raw.trim()) return raw.trim();
  if (!raw || typeof raw !== "object") return null;
  const o = raw as Record<string, unknown>;
  for (const key of ["reply", "response", "message", "answer", "text", "content"]) {
    const v = o[key];
    if (typeof v === "string" && v.trim()) return v.trim();
  }
  const nested = o.data;
  if (nested && typeof nested === "object") {
    const d = nested as Record<string, unknown>;
    for (const key of ["reply", "response", "message", "answer"]) {
      const v = d[key];
      if (typeof v === "string" && v.trim()) return v.trim();
    }
  }
  return null;
}

function pickOptionalString(obj: Record<string, unknown>, key: string): string | undefined {
  const value = obj[key];
  return typeof value === "string" && value.trim() ? value.trim() : undefined;
}

export async function POST(request: NextRequest) {
  const askUrl = (process.env.AI_ASK_URL ?? DEFAULT_ASK_URL).trim() || DEFAULT_ASK_URL;

  try {
    const body = (await request.json()) as {
      message?: string;
      lat?: number;
      lon?: number;
      messages?: ChatMessage[];
    };

    const messages = (body.messages ?? []).filter(
      (msg) => msg && (msg.role === "user" || msg.role === "assistant") && typeof msg.content === "string",
    ) as ChatMessage[];

    const message =
      typeof body.message === "string" && body.message.trim()
        ? body.message.trim()
        : lastUserMessage(messages);

    if (!message) {
      return NextResponse.json({ error: "message is required" }, { status: 400 });
    }

    const lat = typeof body.lat === "number" && Number.isFinite(body.lat) ? body.lat : null;
    const lon = typeof body.lon === "number" && Number.isFinite(body.lon) ? body.lon : null;

    if (lat == null || lon == null) {
      return NextResponse.json(
        { error: "lat and lon are required (numbers) for the AI assistant." },
        { status: 400 },
      );
    }

    const upstreamResponse = await fetch(askUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ message, lat, lon }),
    });

    const ct = upstreamResponse.headers.get("content-type") ?? "";
    let reply: string | null = null;
    let upstreamJson: Record<string, unknown> | null = null;

    if (ct.includes("application/json")) {
      try {
        const data = (await upstreamResponse.json()) as unknown;
        upstreamJson = data && typeof data === "object" ? (data as Record<string, unknown>) : null;
        reply = parseAskReply(data);
      } catch {
        reply = null;
      }
    } else {
      const text = await upstreamResponse.text();
      reply = text.trim() || null;
    }

    if (!upstreamResponse.ok) {
      return NextResponse.json(
        {
          error: "AI service error",
          details: reply ?? `HTTP ${upstreamResponse.status}`,
        },
        { status: 502 },
      );
    }

    if (!reply) {
      return NextResponse.json({ error: "Empty AI response from ask service." }, { status: 502 });
    }

    const workshopUrl =
      upstreamJson?.workshop_url && typeof upstreamJson.workshop_url === "string"
        ? upstreamJson.workshop_url
        : pickOptionalString(upstreamJson ?? {}, "url") ?? pickOptionalString(upstreamJson ?? {}, "link");

    const workshop =
      upstreamJson?.workshop && typeof upstreamJson.workshop === "object"
        ? (upstreamJson.workshop as Record<string, unknown>)
        : null;

    const distance =
      typeof upstreamJson?.distance === "number"
        ? upstreamJson.distance
        : typeof upstreamJson?.distance_km === "number"
          ? upstreamJson.distance_km
          : null;

    return NextResponse.json({
      reply,
      workshop_url: workshopUrl ?? null,
      workshop,
      distance,
    });
  } catch {
    return NextResponse.json({ error: "Failed to process AI chat request." }, { status: 500 });
  }
}
