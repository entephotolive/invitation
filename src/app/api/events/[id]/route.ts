import { NextResponse, type NextRequest } from "next/server";
import { deleteEventForOwner, getEventByIdForOwner, updateEventForOwner } from "@/lib/eventsRepo";
import { eventUpsertSchema } from "@/lib/validators";

const DEFAULT_USER_ID = "default-user";

export async function GET(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const event = await getEventByIdForOwner(id, DEFAULT_USER_ID);
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ event });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Error" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const body = await req.json();
    const parsed = eventUpsertSchema.safeParse(body);
    if (!parsed.success) {
      return NextResponse.json({ error: parsed.error.issues }, { status: 400 });
    }
    const event = await updateEventForOwner(id, DEFAULT_USER_ID, parsed.data);
    if (!event) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ event });
  } catch (e: any) {
    const message = e?.message || "Failed";
    return NextResponse.json({ error: message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    await deleteEventForOwner(id, DEFAULT_USER_ID);
    return NextResponse.json({ ok: true });
  } catch (e: any) {
    return NextResponse.json({ error: e?.message || "Failed" }, { status: 400 });
  }
}

