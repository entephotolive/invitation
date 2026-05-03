import type { ObjectId } from "mongodb";
import type { EventType, ThemeConfig } from "@/themes/types";

export type ImageAsset = { url: string; publicId: string };

export type EventStatus = "active" | "ended";

export type CoupleDetails = {
  bride: { name: string; parents: { father: string; mother: string } };
  groom: { name: string; parents: { father: string; mother: string } };
};

export type HostPerson = { name: string; role?: string };

export type HostDetails = {
  hostName: string;
  hosts?: HostPerson[];
};

export type EventDoc = {
  _id: ObjectId;
  ownerId: string;
  slug: string;
  type: EventType;
  title: string;
  date: Date;
  venue: string;
  mapLink: string;
  description: string;
  theme: ThemeConfig;
  coupleDetails?: CoupleDetails;
  hostDetails?: HostDetails;
  coverImage: ImageAsset | null;
  music: ImageAsset | null;
  gallery: ImageAsset[];
  createdAt: Date;
  updatedAt: Date;
  expiresAt: Date;
  purgeAt: Date;
  assetsPurgedAt: Date | null;
  status: EventStatus;
};

export type RsvpDoc = {
  _id: ObjectId;
  eventId: ObjectId;
  name: string;
  contact: string;
  attending: boolean;
  guestsCount: number;
  message: string;
  createdAt: Date;
};

export type WishDoc = {
  _id: ObjectId;
  eventId: ObjectId;
  name: string;
  message: string;
  createdAt: Date;
};

export type EventDTO = Omit<
  EventDoc,
  "_id" | "date" | "expiresAt" | "purgeAt" | "createdAt" | "updatedAt" | "assetsPurgedAt"
> & {
  _id: string;
  date: string;
  expiresAt: string;
  purgeAt: string;
  createdAt: string;
  updatedAt: string;
  assetsPurgedAt: string | null;
};
