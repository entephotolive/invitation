import { NextResponse } from "next/server";
import { getCollection } from "@/lib/db";
import type { EventDoc } from "@/lib/models";
import { deleteFromCloudinary } from "@/lib/cloudinary";

function isAuthorized(authHeader: string | null) {
  const secret = process.env.CRON_SECRET;
  if (!secret) return false;
  return authHeader === `Bearer ${secret}`;
}

export async function GET(req: Request) {
  if (!isAuthorized(req.headers.get("authorization"))) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  const events = await getCollection("events");
  const rsvps = await getCollection("rsvps");
  const wishes = await getCollection("wishes");

  const now = new Date();
  const due = (await events
    .find({
      expiresAt: { $lte: now },
      assetsPurgedAt: null
    })
    .limit(25)
    .toArray()) as EventDoc[];

  let purged = 0;
  for (const event of due) {
    try {
      if (event.coverImage?.publicId) {
        await deleteFromCloudinary(event.coverImage.publicId);
      }
      if (event.music?.publicId) {
        await deleteFromCloudinary(event.music.publicId);
      }

      await rsvps.deleteMany({ eventId: event._id });
      await wishes.deleteMany({ eventId: event._id });

      await events.updateOne(
        { _id: event._id },
        {
          $set: {
            coverImage: null,
            music: null,
            assetsPurgedAt: now,
            status: "ended",
            updatedAt: now
          }
        }
      );

      purged++;
    } catch {
      // Best-effort: skip failures to avoid blocking other events in this run.
    }
  }

  return NextResponse.json({ ok: true, scanned: due.length, purged });
}

