import { NextResponse } from "next/server";
import { ensureIndexes } from "@/lib/ensureIndexes";

function isAuthorized(authHeader: string | null) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

export async function POST(req: Request) {
  if (!isAuthorized(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }
  await ensureIndexes();
  return NextResponse.json({ ok: true });
}

