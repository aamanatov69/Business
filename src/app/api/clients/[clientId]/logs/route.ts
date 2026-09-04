import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/rosta/admin-auth";
import { getSyncLogsByClient } from "@/lib/server/client-repository";

export async function GET(
  request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const { clientId } = await context.params;
  const url = new URL(request.url);
  const limitRaw = Number(url.searchParams.get("limit"));
  const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? Math.floor(limitRaw) : 20;

  const logs = await getSyncLogsByClient(clientId, limit);

  return NextResponse.json({ ok: true, items: logs }, { status: 200 });
}
