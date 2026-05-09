import { NextResponse } from "next/server";
import { ensureIndexes } from "@/lib/ensureIndexes";

export async function POST(req: Request) {
  await ensureIndexes();
  return NextResponse.json({ ok: true });
}

