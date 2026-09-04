import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/rosta/admin-auth";
import { syncClientCatalog } from "@/lib/rosta/catalog-service";
import { listClients } from "@/lib/server/client-repository";

export async function POST(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const clients = await listClients();
  const activeClients = clients.filter((client) => client.status !== "disabled");

  let succeeded = 0;
  let failed = 0;
  const results: Array<{ clientId: string; ok: boolean; message?: string }> = [];

  for (const client of activeClients) {
    const result = await syncClientCatalog(client.id);

    if (result.ok) {
      succeeded += 1;
      results.push({ clientId: client.id, ok: true });
    } else {
      failed += 1;
      results.push({ clientId: client.id, ok: false, message: result.message });
    }
  }

  return NextResponse.json(
    {
      ok: true,
      data: {
        processed: activeClients.length,
        succeeded,
        failed,
        results,
      },
    },
    { status: 200 },
  );
}
