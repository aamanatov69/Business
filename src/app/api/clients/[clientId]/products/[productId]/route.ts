import { NextResponse } from "next/server";
import {
  getClientProductById,
  sanitizeCatalogError,
} from "@/lib/rosta/catalog-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ clientId: string; productId: string }> },
) {
  try {
    const { clientId, productId } = await context.params;
    const result = await getClientProductById(clientId, productId);

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
