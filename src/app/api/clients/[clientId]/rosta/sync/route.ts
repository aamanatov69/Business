import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/rosta/admin-auth";
import { syncClientCatalog } from "@/lib/rosta/catalog-service";

export async function POST(
  request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const { clientId } = await context.params;
  const date = new URL(request.url).searchParams.get("date")?.trim() || undefined;

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
