import { NextResponse } from "next/server";
import { assertAdmin } from "@/lib/rosta/admin-auth";
import {
  getClientWarehouses,
  sanitizeCatalogError,
} from "@/lib/rosta/catalog-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  const auth = assertAdmin(request);
  if (!auth.ok) {
    return NextResponse.json({ ok: false, message: auth.message }, { status: auth.status });
  }

  try {
    const { clientId } = await context.params;
    const result = await getClientWarehouses(clientId);

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
        items: result.data,
      },
      { status: 200 },
    );
  } catch (error) {
    const normalized = sanitizeCatalogError(error);
    return NextResponse.json(
      {
        ok: false,
        message: normalized.message,
      },
      { status: normalized.status },
    );
  }
}
