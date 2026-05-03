import { z } from "zod";
import type { EventType, ReligionId, ThemeConfig } from "@/themes/types";
import { RELIGIONS } from "@/themes/presets";

const eventTypes = [
  "wedding",
  "reception",
  "engagement",
  "housewarming",
  "birthday",
  "generic"
] as const satisfies readonly EventType[];

export const eventTypeSchema = z.enum(eventTypes);

const religionIds = RELIGIONS.map((r) => r.id) as [ReligionId, ...ReligionId[]];
export const religionSchema = z.enum(religionIds);

const layoutStyles = ["classic", "luxury", "modern"] as const;
const animationStyles = ["soft", "bold", "none"] as const;
const patterns = ["islamic", "mandala", "floral", "minimal", "geometric", "dots"] as const;
const fontTones = ["serif", "sans"] as const;

const hexColor = z
  .string()
  .trim()
  .regex(/^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/, "Invalid hex color");

export const themeSchema = z.object({
  name: z.string().trim().min(1).max(60),
  religion: religionSchema,
  layoutStyle: z.enum(layoutStyles),
  animationStyle: z.enum(animationStyles),
  colors: z.object({
    primary: hexColor,
    secondary: hexColor,
    accent: hexColor
  }),
  headingText: z.string().trim().min(1).max(120),
  pattern: z.enum(patterns),
  fontPairing: z.object({
    heading: z.enum(fontTones),
    body: z.enum(fontTones)
  })
}) satisfies z.ZodType<ThemeConfig>;

const baseEventSchema = z.object({
  slug: z
    .string()
    .trim()
    .min(3)
    .max(80)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/, "Use lowercase letters, numbers, hyphens")
    .optional()
    .or(z.literal("")),
  type: eventTypeSchema,
  title: z.string().trim().min(1).max(120),
  date: z.string().datetime(),
  venue: z.string().trim().max(240).optional().or(z.literal("")),
  mapLink: z.string().trim().url().optional().or(z.literal("")),
  description: z.string().trim().max(2000).optional().or(z.literal("")),
  theme: themeSchema,
  coverImage: z
    .object({
      url: z.string().url(),
      publicId: z.string().min(1)
    })
    .nullable()
    .optional(),
  music: z
    .object({
      url: z.string().url(),
      publicId: z.string().min(1)
    })
    .nullable()
    .optional()
});

const coupleDetailsSchema = z.object({
  bride: z.object({
    name: z.string().trim().min(1).max(120),
    parents: z.object({
      father: z.string().trim().min(1).max(120),
      mother: z.string().trim().min(1).max(120)
    })
  }),
  groom: z.object({
    name: z.string().trim().min(1).max(120),
    parents: z.object({
      father: z.string().trim().min(1).max(120),
      mother: z.string().trim().min(1).max(120)
    })
  })
});

const hostDetailsSchema = z.object({
  hostName: z.string().trim().min(1).max(120)
}).extend({
  hosts: z
    .array(
      z.object({
        name: z.string().trim().min(1).max(120),
        role: z.string().trim().max(120).optional().or(z.literal(""))
      })
    )
    .optional()
});

export const eventUpsertSchema = z.discriminatedUnion("type", [
  baseEventSchema.extend({
    type: z.literal("wedding"),
    coupleDetails: coupleDetailsSchema,
    hostDetails: hostDetailsSchema.optional()
  }),
  baseEventSchema.extend({
    type: z.enum(["reception", "engagement", "housewarming", "birthday", "generic"]),
    hostDetails: hostDetailsSchema,
    coupleDetails: coupleDetailsSchema.optional()
  })
]);

export type EventUpsertInput = z.infer<typeof eventUpsertSchema>;

export const rsvpSchema = z.object({
  name: z.string().trim().min(1).max(80),
  contact: z.string().trim().max(120).optional().or(z.literal("")),
  attending: z.boolean(),
  guestsCount: z.number().int().min(0).max(20),
  message: z.string().trim().max(600).optional().or(z.literal(""))
});

export type RsvpInput = z.infer<typeof rsvpSchema>;

export const wishSchema = z.object({
  name: z.string().trim().min(1).max(80),
  message: z.string().trim().min(1).max(600)
});

export type WishInput = z.infer<typeof wishSchema>;
