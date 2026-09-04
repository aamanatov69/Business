import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/rosta/admin-auth";
import { disconnectClientService } from "@/lib/rosta/service";
import {
  getClientById,
  getItemsByClient,
  getStocksByClient,
  getTradepointsByClient,
  getWarehousesByClient,
  updateClient,
} from "@/lib/server/client-repository";

type PatchClientBody = {
  name?: string;
  status?: "active" | "disabled";
};

export async function GET(
  request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const { clientId } = await context.params;
  const client = await getClientById(clientId);

  if (!client) {
    return NextResponse.json({ ok: false, message: "Client not found." }, { status: 404 });
  }

  const [tradepoints, warehouses, items, stocks] = await Promise.all([
    getTradepointsByClient(clientId),
    getWarehousesByClient(clientId),
    getItemsByClient(clientId),
    getStocksByClient(clientId),
  ]);

  return NextResponse.json(
    {
      ok: true,
      data: {
        id: client.id,
        name: client.name,
        status: client.status,
        apiKeyMasked: client.rostaApiKeyMasked,
        lastSyncAt: client.lastSyncAt,
        lastError: client.lastError,
        createdAt: client.createdAt,
        tradepoints,
        warehouses,
        counts: {
          tradepoints: tradepoints.length,
          warehouses: warehouses.length,
          items: items.length,
          stocks: stocks.length,
        },
      },
    },
    { status: 200 },
  );
}

export async function PATCH(
  request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const { clientId } = await context.params;
  const client = await getClientById(clientId);

  if (!client) {
    return NextResponse.json({ ok: false, message: "Client not found." }, { status: 404 });
  }

  const body = (await request.json()) as PatchClientBody;
  const patch: Parameters<typeof updateClient>[1] = {};

  if (typeof body.name === "string" && body.name.trim()) {
    patch.name = body.name.trim();
  }

  if (body.status === "active" || body.status === "disabled") {
    patch.status = body.status;
  }

  const updated = await updateClient(clientId, patch);

  return NextResponse.json({ ok: true, data: { id: updated?.id, status: updated?.status } }, { status: 200 });
}

export async function DELETE(
  request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const { clientId } = await context.params;
  const result = await disconnectClientService(clientId);

  if (!result.ok) {
    return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
