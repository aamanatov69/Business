import { createCipheriv, createDecipheriv, createHash, randomBytes, timingSafeEqual } from "node:crypto";

export function maskApiKey(raw: string): string {
  const trimmed = raw.trim();
  const tail = trimmed.slice(-4);
  return `${"•".repeat(16)}${tail}`;
}

export function timingSafeStringEqual(a: string, b: string): boolean {
  const bufA = Buffer.from(a, "utf-8");
  const bufB = Buffer.from(b, "utf-8");

  if (bufA.length !== bufB.length) {
    // Still run a comparison of equal-length buffers so the check takes
    // constant time regardless of whether lengths already differ.
    timingSafeEqual(bufA, bufA);
    return false;
  }

  return timingSafeEqual(bufA, bufB);
}

function getEncryptionKey(): Buffer {
  const raw = process.env.ROSTA_ENCRYPTION_KEY?.trim();

  if (!raw) {
    throw new Error("Missing ROSTA_ENCRYPTION_KEY environment variable.");
  }

  // Derive a fixed 32-byte key from input to support both short and long secrets.
  return createHash("sha256").update(raw, "utf-8").digest();
}

export function encryptSecret(value: string): string {
  const key = getEncryptionKey();
  const iv = randomBytes(12);
  const cipher = createCipheriv("aes-256-gcm", key, iv);

  const encrypted = Buffer.concat([cipher.update(value, "utf-8"), cipher.final()]);
  const tag = cipher.getAuthTag();

  return `${iv.toString("hex")}:${tag.toString("hex")}:${encrypted.toString("hex")}`;
}

export function decryptSecret(payload: string): string {
  const [ivHex, tagHex, encryptedHex] = payload.split(":");

  if (!ivHex || !tagHex || !encryptedHex) {
    throw new Error("Invalid encrypted secret format.");
  }

  const key = getEncryptionKey();
  const decipher = createDecipheriv("aes-256-gcm", key, Buffer.from(ivHex, "hex"));
  decipher.setAuthTag(Buffer.from(tagHex, "hex"));

  const decrypted = Buffer.concat([
    decipher.update(Buffer.from(encryptedHex, "hex")),
    decipher.final(),
  ]);

  return decrypted.toString("utf-8");
}
