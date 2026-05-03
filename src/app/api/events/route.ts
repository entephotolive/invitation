import { NextResponse, type NextRequest } from "next/server";
import { requireUserId } from "@/lib/apiAuth";
import { createEventForOwner, listEventsForOwner } from "@/lib/eventsRepo";
import { eventUpsertSchema } from "@/lib/validators";

export async function GET(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    const events = await listEventsForOwner(userId);
    return NextResponse.json({ events });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Unauthorized" }, { status: 401 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const userId = await requireUserId(req);
    const body = await req.json();
    const parsed = eventUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const event = await createEventForOwner(userId, parsed.data);
    return NextResponse.json({ event });
  } catch (e: any) {
    const message = e?.message || "Failed";
    const status = message === "Unauthorized" ? 401 : 400;
    return NextResponse.json({ error: message }, { status });
  }
}

