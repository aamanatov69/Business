import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/rosta/admin-auth";
import { refreshClientStock, syncClientRostaData } from "@/lib/rosta/service";

export async function POST(
  request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const { clientId } = await context.params;

  const syncResult = await syncClientRostaData(clientId);

  if (!syncResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: syncResult.message,
      },
      { status: syncResult.status },
    );
  }

  const date = new URL(request.url).searchParams.get("date")?.trim() || undefined;
  const stockResult = await refreshClientStock(clientId, { date });

  if (!stockResult.ok) {
    return NextResponse.json(
      {
        ok: false,
        message: stockResult.message,
        sync: syncResult.data,
      },
      { status: stockResult.status },
    );
  }

  return NextResponse.json(
    {
      ok: true,
      sync: syncResult.data,
      stock: stockResult.data,
    },
    { status: 200 },
  );
}
