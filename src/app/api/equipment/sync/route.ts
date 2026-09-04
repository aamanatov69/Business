import { NextResponse } from "next/server";
import { syncClientCatalog } from "@/lib/rosta/catalog-service";

function resolveClientId(): string | null {
  return process.env.ROSTA_DEFAULT_UI_CLIENT_ID?.trim() || null;
}

export async function POST(request: Request) {
  const url = new URL(request.url);
  const queryClientId = url.searchParams.get("clientId")?.trim() || null;
  const clientId = queryClientId || resolveClientId();
  const date = url.searchParams.get("date")?.trim() || undefined;

  if (!clientId) {
    return NextResponse.json(
      {
        ok: false,
        message: "Missing ROSTA_DEFAULT_UI_CLIENT_ID for equipment sync.",
      },
      { status: 400 },
    );
  }

  const result = await syncClientCatalog(clientId, date);

  if (!result.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: result.message,
      },
      { status: result.status },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      data: result.data,
    },
    { status: 200 },
  );
}
