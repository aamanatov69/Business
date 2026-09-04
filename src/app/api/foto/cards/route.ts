import { NextResponse } from "next/server";
import { equipmentCatalogDefaults } from "@/lib/home/content";
import {
  getItemsByClient,
  updateItemPresentationById,
} from "@/lib/server/client-repository";

// Change static credentials here.
const FOTO_AUTH_USERNAME = "admin";
const FOTO_AUTH_PASSWORD = "admin123";

type PatchImageBody = {
  itemId?: string;
  image?: string | null;
  category?: string | null;
  showOnHome?: boolean;
  clientId?: string;
};

function resolveDefaultClientId(): string | null {
  return process.env.ROSTA_DEFAULT_UI_CLIENT_ID?.trim() || null;
}

function isAuthorized(request: Request): boolean {
  const user = request.headers.get("x-foto-username")?.trim() || "";
  const pass = request.headers.get("x-foto-password")?.trim() || "";

  return user === FOTO_AUTH_USERNAME && pass === FOTO_AUTH_PASSWORD;
}

function normalizeImage(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  if (trimmed.startsWith("//")) {
    return `https:${trimmed}`;
  }

  if (
    trimmed.startsWith("http://") ||
    trimmed.startsWith("https://") ||
    trimmed.startsWith("/")
  ) {
    return trimmed;
  }

  return `https://${trimmed}`;
}

function normalizeCategory(value: unknown): string | null {
  if (typeof value !== "string") {
    return null;
  }

  const trimmed = value.trim();
  if (!trimmed) {
    return null;
  }

  const byCode = equipmentCatalogDefaults.find(
    (item) => item.shortLabel.toUpperCase() === trimmed.toUpperCase(),
  );
  if (byCode) {
    return byCode.shortLabel;
  }

  const byTitle = equipmentCatalogDefaults.find(
    (item) => item.title.toLowerCase() === trimmed.toLowerCase(),
  );

  return byTitle ? byTitle.shortLabel : null;
}

export async function GET(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  const url = new URL(request.url);
  const clientId =
    url.searchParams.get("clientId")?.trim() || resolveDefaultClientId();

  if (!clientId) {
    return NextResponse.json(
      {
        ok: false,
        message: "Missing clientId. Configure ROSTA_DEFAULT_UI_CLIENT_ID or pass ?clientId=...",
      },
      { status: 400 },
    );
  }

  const items = await getItemsByClient(clientId);

  return NextResponse.json(
    {
      ok: true,
      clientId,
      items: items
        .map((item) => ({
          id: item.id,
          rostaItemId: item.rostaItemId,
          name: item.name,
          image: item.customImage || item.image,
          customImage: item.customImage,
          category: normalizeCategory(item.manualCategory) ?? normalizeCategory(item.category),
          showOnHome: Boolean(item.showOnHome),
        }))
        .sort((a, b) => a.name.localeCompare(b.name, "ru")),
    },
    { status: 200 },
  );
}

export async function PATCH(request: Request) {
  if (!isAuthorized(request)) {
    return NextResponse.json(
      {
        ok: false,
        message: "Unauthorized",
      },
      { status: 401 },
    );
  }

  try {
    const body = (await request.json()) as PatchImageBody;
    const clientId = body.clientId?.trim() || resolveDefaultClientId();

    if (!clientId) {
      return NextResponse.json(
        {
          ok: false,
          message: "Missing clientId.",
        },
        { status: 400 },
      );
    }

    const itemId = body.itemId?.trim();
    if (!itemId) {
      return NextResponse.json(
        {
          ok: false,
          message: "itemId is required.",
        },
        { status: 400 },
      );
    }

    const updated = await updateItemPresentationById(
      clientId,
      itemId,
      {
        customImage: normalizeImage(body.image),
        manualCategory: normalizeCategory(body.category),
        showOnHome:
          typeof body.showOnHome === "boolean" ? body.showOnHome : undefined,
      },
    );

    if (!updated) {
      return NextResponse.json(
        {
          ok: false,
          message: "Item not found.",
        },
        { status: 404 },
      );
    }

    return NextResponse.json(
      {
        ok: true,
        data: {
          id: updated.id,
          image: updated.customImage || updated.image,
          customImage: updated.customImage,
          category: updated.manualCategory ?? updated.category,
          showOnHome: Boolean(updated.showOnHome),
        },
      },
      { status: 200 },
    );
  } catch (error) {
    return NextResponse.json(
      {
        ok: false,
        message: error instanceof Error ? error.message : "Failed to update image.",
      },
      { status: 500 },
    );
  }
}
