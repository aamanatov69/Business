import { timingSafeStringEqual } from "@/lib/server/secrets";

export function assertAdmin(
  request: Request,
): { ok: true } | { ok: false; status: number; message: string } {
  const expected = process.env.ROSTA_ADMIN_TOKEN?.trim();

  if (!expected) {
    return {
      ok: false,
      status: 401,
      message: "Server is missing ROSTA_ADMIN_TOKEN.",
    };
  }

  const headerToken = request.headers.get("x-admin-token")?.trim();
  const authHeader = request.headers.get("authorization")?.trim();
  const bearerToken = authHeader?.toLowerCase().startsWith("bearer ")
    ? authHeader.slice(7).trim()
    : undefined;

  const provided = headerToken || bearerToken;

  if (!provided || !timingSafeStringEqual(provided, expected)) {
    return {
      ok: false,
      status: 401,
      message: "Invalid or missing admin token.",
    };
  }

  return { ok: true };
}
