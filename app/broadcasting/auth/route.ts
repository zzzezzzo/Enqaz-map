import { NextRequest, NextResponse } from "next/server";

function upstreamOrigin(): string {
  return (
    process.env.BROADCAST_AUTH_UPSTREAM ??
    process.env.NEXT_PUBLIC_BACKEND_URL ??
    "http://127.0.0.1:8000"
  ).replace(/\/$/, "");
}

/**
 * Proxies Laravel private-channel auth so the browser calls same-origin
 * `/broadcasting/auth` (avoids CORS when the Next app and API differ by host/port).
 */
export async function POST(req: NextRequest) {
  const target = `${upstreamOrigin()}/broadcasting/auth`;
  const authorization = req.headers.get("authorization");
  const contentType =
    req.headers.get("content-type") ?? "application/x-www-form-urlencoded";
  const accept = req.headers.get("accept") ?? "application/json";
  const body = await req.text();

  let upstream: Response;
  try {
    upstream = await fetch(target, {
      method: "POST",
      headers: {
        "Content-Type": contentType,
        Accept: accept,
        ...(authorization ? { Authorization: authorization } : {}),
      },
      body,
    });
  } catch {
    return NextResponse.json(
      { message: "Broadcasting auth upstream unreachable", upstream: target },
      { status: 502 }
    );
  }

  const text = await upstream.text();
  const ct = upstream.headers.get("content-type") ?? "application/json";
  return new NextResponse(text, {
    status: upstream.status,
    headers: { "Content-Type": ct },
  });
}
