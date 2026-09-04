import { NextResponse } from "next/server";
import {
  getClientProducts,
  normalizeCatalogQuery,
  sanitizeCatalogError,
} from "@/lib/rosta/catalog-service";

export async function GET(
  request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  try {
    const { clientId } = await context.params;
    const query = normalizeCatalogQuery(new URL(request.url).searchParams);
    const result = await getClientProducts(clientId, query);

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
        items: result.data.items,
        pagination: result.data.pagination,
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
