import { NextResponse } from "next/server";
import {
  getCatalogBundle,
  normalizeCatalogQuery,
} from "@/lib/rosta/catalog-service";

function resolveClientId(): string | null {
  return process.env.ROSTA_DEFAULT_UI_CLIENT_ID?.trim() || null;
}

export async function GET(request: Request) {
  const url = new URL(request.url);
  const queryClientId = url.searchParams.get("clientId")?.trim() || null;
  const clientId = queryClientId || resolveClientId();

  if (!clientId) {
    return NextResponse.json(
      {
        ok: false,
        message: "Missing ROSTA_DEFAULT_UI_CLIENT_ID for equipment catalog.",
      },
      { status: 400 },
    );
  }

  const query = normalizeCatalogQuery(url.searchParams);
  const result = await getCatalogBundle(clientId, query);

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
