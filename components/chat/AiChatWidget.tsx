"use client";

import { FormEvent, useEffect, useMemo, useState } from "react";
import { Bot, Link as LinkIcon, MessageCircle, Phone, Ruler, Send, Wrench, X } from "lucide-react";

type Message = {
  id: string;
  role: "user" | "assistant";
  content: string;
  workshopData?: WorkshopCardData | null;
};

type WorkshopCardData = {
  name: string;
  distanceKm: string | null;
  detailsUrl: string | null;
  phone: string | null;
};

const INITIAL_MESSAGE: Message = {
  id: "welcome",
  role: "assistant",
  content: "Hello! I am ENQAZ AI assistant. How can I help you today?",
};

function normalizeText(text: string): string {
  return text.replace(/\r/g, "").trim();
}

function stripMarkdownMarkers(text: string): string {
  return text
    .replace(/\*\*/g, "")
    .replace(/__/g, "")
    .replace(/`/g, "")
    .trim();
}

function parseWorkshopData(content: string): WorkshopCardData | null {
  const trimmed = normalizeText(content);
  if (!trimmed) return null;
  const plain = stripMarkdownMarkers(trimmed);

  const tryParsedJson = () => {
    try {
      const parsed = JSON.parse(trimmed) as Record<string, unknown>;
      if (!parsed || typeof parsed !== "object") return null;
      const workshop =
        parsed.workshop && typeof parsed.workshop === "object"
          ? (parsed.workshop as Record<string, unknown>)
          : null;
      const name =
        typeof parsed.name === "string"
          ? parsed.name.trim()
          : typeof parsed.workshop_name === "string"
            ? parsed.workshop_name.trim()
            : typeof workshop?.name === "string"
              ? workshop.name.trim()
            : "";
      if (!name) return null;
      const distanceSource =
        typeof parsed.distance_km === "number"
          ? parsed.distance_km.toString()
          : typeof parsed.distance === "number"
            ? parsed.distance.toString()
          : typeof parsed.distance === "string"
            ? parsed.distance
            : null;
      const detailsUrl =
        typeof parsed.url === "string"
          ? parsed.url.trim()
          : typeof parsed.link === "string"
            ? parsed.link.trim()
            : typeof parsed.workshop_url === "string"
              ? parsed.workshop_url.trim()
            : null;
      const phone =
        typeof parsed.phone === "string"
          ? parsed.phone.trim()
          : typeof parsed.mobile === "string"
            ? parsed.mobile.trim()
            : typeof workshop?.phone === "string"
              ? workshop.phone.trim()
            : null;

      const markdownLinkMatch = trimmed.match(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/i);
      return {
        name,
        distanceKm: distanceSource ? distanceSource.replace(/[^\d.]/g, "") || null : null,
        detailsUrl: detailsUrl || markdownLinkMatch?.[1] || null,
        phone: phone && phone !== "غير متوفر" ? phone : null,
      };
    } catch {
      return null;
    }
  };

  const fromJson = tryParsedJson();
  if (fromJson) return fromJson;

  const nameMatch =
    plain.match(/(?:^|\n)\s*(?:name|workshop(?:\s*name)?)\s*[:\-]\s*(.+)/i) ??
    plain.match(/(?:^|\n)\s*(?:اسم\s*الورشة|اسم|الاسم)\s*[:\-]\s*(.+)/i);
  if (!nameMatch?.[1]) return null;

  const distanceMatch =
    plain.match(/(?:^|\n)\s*(?:distance)\s*[:\-]\s*([\d.]+)/i) ??
    plain.match(/(?:^|\n)\s*(?:المسافة)\s*[:\-]\s*([\d.]+)/i);
  const markdownLinkMatch = trimmed.match(/\[[^\]]+\]\((https?:\/\/[^)\s]+)\)/i);
  const urlMatch = markdownLinkMatch ?? trimmed.match(/https?:\/\/[^\s)]+/i);
  const phoneMatch = plain.match(/(?:\+?\d[\d\s\-()]{7,}\d)/);

  return {
    name: stripMarkdownMarkers(nameMatch[1]),
    distanceKm: distanceMatch?.[1] ?? null,
    detailsUrl: urlMatch?.[1] ?? urlMatch?.[0] ?? null,
    phone: phoneMatch?.[0]?.replace(/\s+/g, " ") ?? null,
  };
}

function readWorkshopFromApiPayload(data: {
  workshop_url?: string | null;
  workshop?: { name?: string | null; phone?: string | null } | null;
  distance?: number | null;
}): WorkshopCardData | null {
  const name = data.workshop?.name?.trim();
  if (!name) return null;
  const detailsUrl = data.workshop_url?.trim() || null;
  const phone = data.workshop?.phone?.trim() || null;
  const distanceKm =
    typeof data.distance === "number" && Number.isFinite(data.distance)
      ? String(data.distance)
      : null;

  return {
    name,
    detailsUrl,
    distanceKm,
    phone: phone && phone !== "غير متوفر" ? phone : null,
  };
}

function AssistantMessage({ content, workshopData }: { content: string; workshopData?: WorkshopCardData | null }) {
  const workshop = workshopData ?? parseWorkshopData(content);
  if (!workshop) {
    return <p className="whitespace-pre-wrap">{stripMarkdownMarkers(content)}</p>;
  }

  return (
    <div className="space-y-3" dir="auto">
      <p className="font-semibold text-slate-900">إلقيتلك أقرب ورشة مفتوحة</p>
      <div className="space-y-1.5 text-sm text-slate-700">
        <p className="flex items-center gap-2">
          <Wrench className="h-4 w-4 text-[#f59e0b]" />
          <span>اسم الورشة: {workshop.name}</span>
        </p>
        {workshop.distanceKm ? (
          <p className="flex items-center gap-2">
            <Ruler className="h-4 w-4 text-[#f59e0b]" />
            <span>المسافة: {workshop.distanceKm} كم</span>
          </p>
        ) : null}
      </div>
      <div className="rounded-2xl border-2 border-[#facc15] bg-slate-100 p-4">
        <div className="mb-3 flex items-start justify-between gap-3">
          <p className="text-base font-bold text-slate-800">{workshop.name}</p>
          <Wrench className="h-6 w-6 text-slate-700" />
        </div>
        <div className="mb-4 space-y-1 text-sm text-slate-700">
          {workshop.distanceKm ? (
            <p className="flex items-center gap-1.5">
              <Ruler className="h-4 w-4 text-slate-600" />
              <span>المسافة: {workshop.distanceKm} كم</span>
            </p>
          ) : null}
          {workshop.phone ? (
            <p className="flex items-center gap-1.5">
              <Phone className="h-4 w-4 text-slate-600" />
              <span>{workshop.phone}</span>
            </p>
          ) : null}
        </div>
        <div className="flex flex-wrap gap-2">
          
          {workshop.detailsUrl ? (
            <a
              href={workshop.detailsUrl}
              target="_blank"
              rel="noreferrer"
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#f59e0b] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#d48806]"
            >
              <LinkIcon className="h-3.5 w-3.5" />
              صفحة الورشة
            </a>
          ) : (
            <p className="text-xs text-slate-500">No workshop link returned from AI response.</p>
          )}
          {workshop.phone ? (
            <a
              href={`tel:${workshop.phone.replace(/[^\d+]/g, "")}`}
              className="inline-flex items-center gap-1.5 rounded-lg bg-[#38a3d8] px-3 py-2 text-xs font-semibold text-white transition hover:bg-[#2c8cbb]"
            >
              <Phone className="h-3.5 w-3.5" />
              اتصال
            </a>
          ) : null}
        </div>
      </div>
    </div>
  );
}

export default function AiChatWidget() {
  const [isOpen, setIsOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState<Message[]>([INITIAL_MESSAGE]);
  const [geo, setGeo] = useState<{
    lat: number | null;
    lon: number | null;
    loading: boolean;
    error: string | null;
  }>({ lat: null, lon: null, loading: false, error: null });

  useEffect(() => {
    if (!isOpen) return;

    if (!navigator.geolocation) {
      setGeo((g) => ({
        ...g,
        loading: false,
        error: "Geolocation is not supported in this browser.",
      }));
      return;
    }

    setGeo((g) => ({ ...g, loading: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setGeo({
          lat: pos.coords.latitude,
          lon: pos.coords.longitude,
          loading: false,
          error: null,
        });
      },
      () => {
        setGeo({
          lat: null,
          lon: null,
          loading: false,
          error: "Location is required for the assistant. Please allow access.",
        });
      },
      { enableHighAccuracy: true, maximumAge: 60_000, timeout: 15_000 }
    );
  }, [isOpen]);

  const canSend = useMemo(
    () =>
      input.trim().length > 0 &&
      !isLoading &&
      !geo.loading &&
      geo.lat != null &&
      geo.lon != null,
    [input, isLoading, geo.loading, geo.lat, geo.lon]
  );

  const sendMessage = async (event: FormEvent) => {
    event.preventDefault();
    const question = input.trim();
    if (!question || isLoading) return;

    const userMessage: Message = {
      id: crypto.randomUUID(),
      role: "user",
      content: question,
    };

    const nextMessages = [...messages, userMessage];
    setMessages(nextMessages);
    setInput("");

    if (geo.lat == null || geo.lon == null) {
      setMessages([
        ...nextMessages,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content:
            geo.error ??
            "Waiting for your location. Please allow location access and try again.",
        },
      ]);
      return;
    }

    setIsLoading(true);

    try {
      const response = await fetch("/api/ai-chat", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          message: question,
          lat: geo.lat,
          lon: geo.lon,
          messages: nextMessages.map((msg) => ({ role: msg.role, content: msg.content })),
        }),
      });

      const data = (await response.json()) as {
        reply?: string;
        error?: string;
        workshop_url?: string | null;
        workshop?: { name?: string | null; phone?: string | null } | null;
        distance?: number | null;
      };

      if (!response.ok || !data.reply) {
        throw new Error(data.error || "AI request failed");
      }

      const replyText = data.reply ?? "";
      const workshopData = readWorkshopFromApiPayload(data);
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: replyText,
          workshopData,
        },
      ]);
    } catch {
      setMessages((prev) => [
        ...prev,
        {
          id: crypto.randomUUID(),
          role: "assistant",
          content: "I could not answer right now. Please try again in a moment.",
        },
      ]);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <>
      {isOpen ? (
        <div className="fixed bottom-20 right-4 z-50 w-[22rem] max-w-[calc(100vw-2rem)] rounded-2xl border border-slate-200 bg-white shadow-2xl">
          <div className="flex items-center justify-between rounded-t-2xl bg-[#0f2744] px-4 py-3 text-white">
            <div className="flex items-center gap-2">
              <Bot className="h-5 w-5" />
              <p className="text-sm font-semibold">ENQAZ AI Assistant</p>
            </div>
            <button
              type="button"
              className="rounded-md p-1.5 transition hover:bg-white/10"
              onClick={() => setIsOpen(false)}
              aria-label="Close AI chat"
            >
              <X className="h-4 w-4" />
            </button>
          </div>

          <div className="h-80 space-y-3 overflow-y-auto bg-slate-50 p-3">
            {geo.loading ? (
              <p className="text-xs text-slate-500">Getting your location for nearby help…</p>
            ) : null}
            {!geo.loading && geo.error ? (
              <p className="text-xs text-amber-700">{geo.error}</p>
            ) : null}
            {messages.map((msg) => (
              <div
                key={msg.id}
                className={`max-w-[85%] rounded-xl px-3 py-2 text-sm ${
                  msg.role === "user"
                    ? "ml-auto bg-[#0f2744] text-white"
                    : "w-full max-w-full bg-white text-slate-700 shadow-sm"
                }`}
              >
                {msg.role === "assistant" ? (
                  <AssistantMessage content={msg.content} workshopData={msg.workshopData} />
                ) : (
                  msg.content
                )}
              </div>
            ))}
            {isLoading ? <p className="text-xs text-slate-500">AI is typing...</p> : null}
          </div>

          <form onSubmit={sendMessage} className="border-t border-slate-200 bg-white p-3">
            <div className="flex items-center gap-2 rounded-xl border border-slate-200 px-2 py-1.5">
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Ask anything..."
                className="flex-1 bg-transparent px-1 text-sm text-slate-800 outline-none placeholder:text-slate-400"
              />
              <button
                type="submit"
                disabled={!canSend}
                className="rounded-lg bg-[#0f2744] p-2 text-white transition enabled:hover:bg-[#0c2036] disabled:cursor-not-allowed disabled:opacity-50"
                aria-label="Send message"
              >
                <Send className="h-4 w-4" />
              </button>
            </div>
          </form>
        </div>
      ) : null}

      <button
        type="button"
        onClick={() => setIsOpen((prev) => !prev)}
        className="fixed bottom-4 right-4 z-50 flex h-14 w-14 items-center justify-center rounded-full bg-[#0f2744] text-white shadow-lg transition hover:bg-[#0c2036]"
        aria-label="Open AI chat"
      >
        <MessageCircle className="h-6 w-6" />
      </button>
    </>
  );
}
