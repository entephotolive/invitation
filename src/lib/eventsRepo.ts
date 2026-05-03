import { ObjectId } from "mongodb";
import { getCollection } from "@/lib/db";
import type { EventDTO, EventDoc, RsvpDoc, WishDoc } from "@/lib/models";
import { generateUniqueSlug, slugify } from "@/lib/slugify";
import type { EventUpsertInput, RsvpInput, WishInput } from "@/lib/validators";
import { defaultThemeForReligion } from "@/themes/presets";
import type { ThemeConfig } from "@/themes/types";

const EVENTS = "events";
const RSVPS = "rsvps";
const WISHES = "wishes";

export function toEventDTO(event: EventDoc): EventDTO {
  return {
    ...event,
    _id: event._id.toString(),
    date: event.date.toISOString(),
    expiresAt: event.expiresAt.toISOString(),
    purgeAt: event.purgeAt.toISOString(),
    createdAt: event.createdAt.toISOString(),
    updatedAt: event.updatedAt.toISOString(),
    assetsPurgedAt: event.assetsPurgedAt ? event.assetsPurgedAt.toISOString() : null
  };
}

function computeExpiresAt(date: Date) {
  const fortyEightHours = 48 * 60 * 60 * 1000;
  return new Date(date.getTime() + fortyEightHours);
}

function computePurgeAt(expiresAt: Date) {
  const days = 30;
  return new Date(expiresAt.getTime() + days * 24 * 60 * 60 * 1000);
}

function computeStatus(expiresAt: Date) {
  return expiresAt.getTime() <= Date.now() ? "ended" : "active";
}

function normalizeTheme(theme: any): ThemeConfig {
  const base = defaultThemeForReligion((theme?.religion as any) || "neutral");
  if (!theme || typeof theme !== "object" || !theme.colors) return base;
  return {
    ...base,
    ...theme,
    colors: { ...base.colors, ...(theme.colors || {}) },
    fontPairing: { ...base.fontPairing, ...(theme.fontPairing || {}) }
  } as ThemeConfig;
}

function normalizeEventDoc(doc: any): EventDoc {
  // Backward-compat for older schema (eventName/coupleNames/themeId/startsAt/etc)
  if (doc?.title && doc?.date && doc?.theme) {
    return { ...doc, theme: normalizeTheme(doc.theme) } as EventDoc;
  }

  const theme = normalizeTheme(doc?.theme);
  const title = doc?.eventName || doc?.title || "Event";
  const date = doc?.startsAt ? new Date(doc.startsAt) : new Date();
  const venue = [doc?.venueName, doc?.venueAddress].filter(Boolean).join(" • ");
  const mapLink = doc?.mapsLink || doc?.mapLink || "";

  return {
    ...doc,
    type: doc?.type || "generic",
    title,
    date,
    venue: venue || doc?.venue || "",
    mapLink,
    theme,
    hostDetails: doc?.hostDetails,
    description: doc?.description || "",
    coverImage: doc?.coverImage ?? null,
    music: doc?.music ?? null,
    gallery: Array.isArray(doc?.gallery) ? doc.gallery : []
  } as EventDoc;
}

async function uniqueSlugOrThrow(inputSlug: string, excludeId?: string) {
  const events = await getCollection(EVENTS);
  const slug = slugify(inputSlug);
  const query: any = { slug };
  if (excludeId) query._id = { $ne: new ObjectId(excludeId) };
  const exists = await events.findOne(query);
  if (exists) throw new Error("Slug already in use");
  return slug;
}

async function generateGlobalUniqueSlug(base: string) {
  const events = await getCollection(EVENTS);
  for (let i = 0; i < 5; i++) {
    const candidate = i === 0 ? generateUniqueSlug(base) : generateUniqueSlug(`${base}-${i}`);
    const exists = await events.findOne({ slug: candidate });
    if (!exists) return candidate;
  }
  return generateUniqueSlug(`${base}-${Date.now()}`);
}

export async function listEventsForOwner(ownerId: string) {
  const col = await getCollection(EVENTS);
  const docs = (await col
    .find({ ownerId })
    .sort({ updatedAt: -1 })
    .project({ slug: 1, type: 1, title: 1, status: 1 })
    .toArray()) as any[];
  return docs.map((d) => ({
    _id: d._id.toString(),
    slug: d.slug,
    type: d.type,
    title: d.title || d.eventName || "Event",
    status: d.status
  }));
}

export async function getEventByIdForOwner(id: string, ownerId: string): Promise<EventDTO | null> {
  const col = await getCollection(EVENTS);
  const doc = await col.findOne({ _id: new ObjectId(id), ownerId });
  return doc ? toEventDTO(normalizeEventDoc(doc)) : null;
}

export async function getPublicEventBySlug(slug: string): Promise<EventDTO | null> {
  const col = await getCollection(EVENTS);
  const found = await col.findOne({ slug });
  const doc = found ? normalizeEventDoc(found) : null;
  if (!doc) return null;

  const status = computeStatus(doc.expiresAt);
  if (status !== doc.status) {
    await col.updateOne(
      { _id: doc._id },
      { $set: { status, updatedAt: new Date() } }
    );
    doc.status = status;
  }

  return toEventDTO(doc);
}

export async function createEventForOwner(ownerId: string, input: EventUpsertInput): Promise<EventDTO> {
  const col = await getCollection(EVENTS);
  const now = new Date();
  const date = new Date(input.date);
  const expiresAt = computeExpiresAt(date);
  const purgeAt = computePurgeAt(expiresAt);

  const slug =
    input.slug && input.slug.trim().length > 0
      ? await uniqueSlugOrThrow(input.slug)
      : await generateGlobalUniqueSlug(input.title);

  const doc: Omit<EventDoc, "_id"> = {
    ownerId,
    slug,
    type: input.type,
    title: input.title,
    date,
    venue: input.venue || "",
    mapLink: input.mapLink || "",
    description: input.description || "",
    theme: input.theme,
    ...(input.type === "wedding"
      ? { coupleDetails: input.coupleDetails, hostDetails: input.hostDetails }
      : { hostDetails: input.hostDetails, coupleDetails: input.coupleDetails }),
    coverImage: input.coverImage ?? null,
    music: input.music ?? null,
    gallery: [],
    createdAt: now,
    updatedAt: now,
    expiresAt,
    purgeAt,
    assetsPurgedAt: null,
    status: computeStatus(expiresAt)
  };

  const result = await col.insertOne(doc);
  const created = await col.findOne({ _id: result.insertedId });
  return toEventDTO(normalizeEventDoc(created));
}

export async function updateEventForOwner(
  id: string,
  ownerId: string,
  input: EventUpsertInput
): Promise<EventDTO | null> {
  const col = await getCollection(EVENTS);
  const now = new Date();
  const date = new Date(input.date);
  const expiresAt = computeExpiresAt(date);
  const purgeAt = computePurgeAt(expiresAt);

  const slug =
    input.slug && input.slug.trim().length > 0
      ? await uniqueSlugOrThrow(input.slug, id)
      : undefined;

  await col.updateOne(
    { _id: new ObjectId(id), ownerId },
    {
      $set: {
        ...(slug ? { slug } : {}),
        type: input.type,
        title: input.title,
        date,
        expiresAt,
        purgeAt,
        status: computeStatus(expiresAt),
        venue: input.venue || "",
        mapLink: input.mapLink || "",
        description: input.description || "",
        theme: input.theme,
        ...(input.type === "wedding"
          ? { coupleDetails: input.coupleDetails, hostDetails: input.hostDetails }
          : { hostDetails: input.hostDetails, coupleDetails: input.coupleDetails }),
        coverImage: input.coverImage ?? null,
        music: input.music ?? null,
        updatedAt: now
      }
    }
  );

  const updated = await col.findOne({ _id: new ObjectId(id), ownerId });
  return updated ? toEventDTO(normalizeEventDoc(updated)) : null;
}

export async function deleteEventForOwner(id: string, ownerId: string) {
  const col = await getCollection(EVENTS);
  return col.deleteOne({ _id: new ObjectId(id), ownerId });
}

export async function addRsvpBySlug(slug: string, input: RsvpInput) {
  const events = await getCollection(EVENTS);
  const event = (await events.findOne({ slug })) as EventDoc | null;
  if (!event) throw new Error("Event not found");
  if (computeStatus(event.expiresAt) === "ended") throw new Error("Event ended");

  const rsvps = await getCollection(RSVPS);
  const doc: Omit<RsvpDoc, "_id"> = {
    eventId: event._id,
    name: input.name,
    contact: input.contact || "",
    attending: input.attending,
    guestsCount: input.guestsCount,
    message: input.message || "",
    createdAt: new Date()
  };
  await rsvps.insertOne(doc);
}

export async function listRsvpsForEvent(eventId: string) {
  const rsvps = await getCollection(RSVPS);
  const docs = (await rsvps
    .find({ eventId: new ObjectId(eventId) })
    .sort({ createdAt: -1 })
    .toArray()) as RsvpDoc[];
  return docs.map((d) => ({ ...d, _id: d._id.toString(), eventId: d.eventId.toString() }));
}

export async function addWishBySlug(slug: string, input: WishInput) {
  const events = await getCollection(EVENTS);
  const event = (await events.findOne({ slug })) as EventDoc | null;
  if (!event) throw new Error("Event not found");
  if (computeStatus(event.expiresAt) === "ended") throw new Error("Event ended");

  const wishes = await getCollection(WISHES);
  const doc: Omit<WishDoc, "_id"> = {
    eventId: event._id,
    name: input.name,
    message: input.message,
    createdAt: new Date()
  };
  await wishes.insertOne(doc);
}

export async function listWishesBySlug(slug: string) {
  const events = await getCollection(EVENTS);
  const event = (await events.findOne({ slug })) as EventDoc | null;
  if (!event) throw new Error("Event not found");

  const wishes = await getCollection(WISHES);
  const docs = (await wishes
    .find({ eventId: event._id })
    .sort({ createdAt: -1 })
    .limit(50)
    .toArray()) as WishDoc[];
  return docs.map((d) => ({
    ...d,
    _id: d._id.toString(),
    eventId: d.eventId.toString(),
    createdAt: d.createdAt.toISOString()
  }));
}
