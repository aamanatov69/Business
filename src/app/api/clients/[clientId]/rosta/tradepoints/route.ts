import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/rosta/admin-auth";
import { getTradepointsByClient } from "@/lib/server/client-repository";

export async function GET(
  request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const { clientId } = await context.params;
  const tradepoints = await getTradepointsByClient(clientId);

  return NextResponse.json({ ok: true, items: tradepoints }, { status: 200 });
}
