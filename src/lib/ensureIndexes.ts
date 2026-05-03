import { getCollection } from "@/lib/db";

export async function ensureIndexes() {
  const events = await getCollection("events");
  const rsvps = await getCollection("rsvps");
  const wishes = await getCollection("wishes");

  await events.createIndex({ slug: 1 }, { unique: true, name: "slug_unique" });
  await events.createIndex(
    { purgeAt: 1 },
    { expireAfterSeconds: 0, name: "purge_ttl" }
  );
  await events.createIndex({ ownerId: 1, updatedAt: -1 }, { name: "owner_updated" });

  await rsvps.createIndex({ eventId: 1, createdAt: -1 }, { name: "event_created" });
  await wishes.createIndex({ eventId: 1, createdAt: -1 }, { name: "event_created" });
}
