import { NextResponse } from "next/server";
import { refreshClientStock } from "@/lib/rosta/service";

function resolveClientId(): string | null {
  return process.env.ROSTA_DEFAULT_UI_CLIENT_ID?.trim() || null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryClientId = url.searchParams.get("clientId")?.trim() || null;
  const clientId = queryClientId || resolveClientId();
  const date = url.searchParams.get("date")?.trim() || undefined;

  if (!clientId) {
    return NextResponse.json(
      {
        ok: false,
        message: "Missing ROSTA_DEFAULT_UI_CLIENT_ID for equipment stock view.",
        rows: [],
      },
      { status: 400 },
    );
  }

  const result = await refreshClientStock(clientId, { date });

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: result.message,
        rows: [],
      },
      { status: result.status },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      clientId,
      warning: result.data.warning,
      detectedQuantityFields: result.data.detectedQuantityFields,
      rows: result.data.viewRows,
      rawResponses: result.data.rawResponses,
    },
    { status: 200 },
  );
}
