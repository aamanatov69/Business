import { NextResponse } from "next/server";
import {
  getClientCategories,
  sanitizeCatalogError,
} from "@/lib/rosta/catalog-service";

export async function GET(
  _request: Request,
  context: { params: Promise<{ clientId: string }> },
) {
  try {
    const { clientId } = await context.params;
    const result = await getClientCategories(clientId);

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
