import { NextResponse, type NextRequest } from "next/server";
import { createEventForOwner, listEventsForOwner } from "@/lib/eventsRepo";
import { eventUpsertSchema } from "@/lib/validators";

const DEFAULT_USER_ID = "default-user";

export async function GET(req: NextRequest) {
  try {
    const events = await listEventsForOwner(DEFAULT_USER_ID);
    return NextResponse.json({ events });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const parsed = eventUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const event = await createEventForOwner(DEFAULT_USER_ID, parsed.data);
    return NextResponse.json({ event });
  } catch (e: any) {
    const message = e?.message || "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

