import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/rosta/admin-auth";
import { connectClient } from "@/lib/rosta/service";
import {
  getItemsByClient,
  getStocksByClient,
  getTradepointsByClient,
  getWarehousesByClient,
  listClients,
} from "@/lib/server/client-repository";

type ConnectClientBody = {
  name?: string;
  apiKey?: string;
};

function badRequest(message: string) {
  return NextResponse.json({ ok: false, message }, { status: 400 });
}

export async function GET(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  const clients = await listClients();

  const data = await Promise.all(
    clients.map(async (client) => {
      const [tradepoints, warehouses, items, stocks] = await Promise.all([
        getTradepointsByClient(client.id),
        getWarehousesByClient(client.id),
        getItemsByClient(client.id),
        getStocksByClient(client.id),
      ]);

      return {
        id: client.id,
        name: client.name,
        status: client.status,
        apiKeyMasked: client.rostaApiKeyMasked,
        lastSyncAt: client.lastSyncAt,
        lastError: client.lastError,
        createdAt: client.createdAt,
        counts: {
          tradepoints: tradepoints.length,
          warehouses: warehouses.length,
          items: items.length,
          stocks: stocks.length,
        },
      };
    }),
  );

  return NextResponse.json({ ok: true, data }, { status: 200 });
}

export async function POST(request: Request) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  try {
    const body = (await request.json()) as ConnectClientBody;
    const apiKey = body.apiKey?.trim();

    if (!apiKey) {
      return badRequest("Rosta API key is required.");
    }

    if (!process.env.ROSTA_ENCRYPTION_KEY?.trim()) {
      return NextResponse.json(
        { ok: false, message: "Server is missing ROSTA_ENCRYPTION_KEY." },
        { status: 500 },
      );
    }

    const name = body.name?.trim() || `Rosta client ${new Date().toISOString().slice(0, 16)}`;

    const result = await connectClient({ name, apiKey });

    if (!result.ok) {
      return NextResponse.json({ ok: false, message: result.message }, { status: result.status });
    }

    return NextResponse.json({ ok: true, data: result.data }, { status: 201 });
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: "Failed to connect Rosta client.",
        details: error instanceof Error ? error.message : "unknown_error",
      },
      { status: 500 },
    );
  }
}
