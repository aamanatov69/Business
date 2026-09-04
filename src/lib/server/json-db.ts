import { mkdir, readFile, writeFile } from "node:fs/promises";
import path from "node:path";
import { emptyDb, type AppDb } from "@/lib/server/db-schema";

const dbDir = path.join(process.cwd(), "data");
const dbFilePath = path.join(dbDir, "app-db.json");

let writeChain: Promise<void> = Promise.resolve();

async function ensureDbFile() {
  await mkdir(dbDir, { recursive: true });

  try {
    await readFile(dbFilePath, "utf-8");
  } catch {
    await writeFile(dbFilePath, JSON.stringify(emptyDb, null, 2), "utf-8");
  }
}

function normalizeDbShape(raw: unknown): AppDb {
  if (!raw || typeof raw !== "object") {
    return { ...emptyDb };
  }

  const value = raw as Partial<AppDb>;

  return {
    clients: Array.isArray(value.clients) ? value.clients : [],
    rostaTradepoints: Array.isArray(value.rostaTradepoints) ? value.rostaTradepoints : [],
    rostaWarehouses: Array.isArray(value.rostaWarehouses) ? value.rostaWarehouses : [],
    rostaItems: Array.isArray(value.rostaItems) ? value.rostaItems : [],
    rostaAttributes: Array.isArray(value.rostaAttributes) ? value.rostaAttributes : [],
    rostaStocks: Array.isArray(value.rostaStocks) ? value.rostaStocks : [],
    rostaSyncLogs: Array.isArray(value.rostaSyncLogs) ? value.rostaSyncLogs : [],
  };
}

export async function readDb(): Promise<AppDb> {
  await ensureDbFile();
  const content = await readFile(dbFilePath, "utf-8");

  try {
    return normalizeDbShape(JSON.parse(content) as unknown);
  } catch {
    return { ...emptyDb };
  }
}

export async function updateDb(updater: (db: AppDb) => AppDb | Promise<AppDb>): Promise<AppDb> {
  let result: AppDb = { ...emptyDb };

  writeChain = writeChain.then(async () => {
    const current = await readDb();
    const next = await updater(current);
    result = next;
    await writeFile(dbFilePath, JSON.stringify(next, null, 2), "utf-8");
  });

  await writeChain;
  return result;
}
