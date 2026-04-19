import { readFile } from "node:fs/promises";
import { dirname, resolve } from "node:path";
import { fileURLToPath } from "node:url";
import pg from "pg";

const { Client } = pg;

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const schemaPath = resolve(__dirname, "../supabase/schema.sql");
const connectionString =
  process.env.POSTGRES_URL_NON_POOLING ??
  process.env.POSTGRES_URL ??
  process.env.POSTGRES_PRISMA_URL;

if (!connectionString) {
  throw new Error(
    "Missing database connection string. Set POSTGRES_URL_NON_POOLING, POSTGRES_URL, or POSTGRES_PRISMA_URL.",
  );
}

const sql = await readFile(schemaPath, "utf8");
const connectionUrl = new URL(connectionString);

connectionUrl.searchParams.delete("sslmode");

const client = new Client({
  connectionString: connectionUrl.toString(),
  ssl: {
    rejectUnauthorized: false,
  },
});

try {
  await client.connect();
  await client.query(sql);
  console.log("Supabase schema applied successfully.");
} finally {
  await client.end();
}
