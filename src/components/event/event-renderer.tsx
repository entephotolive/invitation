"use client";

import Image from "next/image";
import Link from "next/link";
import { motion } from "framer-motion";
import { MapPin, Calendar, Link as LinkIcon } from "lucide-react";
import type React from "react";
import { Countdown } from "@/components/event/countdown";
import { MusicToggle } from "@/components/event/music-toggle";
import { cn } from "@/lib/cn";
import type { CoupleDetails, HostDetails } from "@/lib/models";
import type { EventType, ThemeConfig } from "@/themes/types";
import { motionPreset, themeClasses, themeCssVars } from "@/themes/engine";

export type EventViewModel = {
  slug?: string;
  type: EventType;
  title: string;
  date: string;
  venue?: string;
  mapLink?: string;
  description?: string;
  theme: ThemeConfig;
  coupleDetails?: CoupleDetails;
  hostDetails?: HostDetails;
  coverImageUrl?: string;
  musicUrl?: string;
  status?: "active" | "ended";
};

function formatDateTime(iso: string) {
  const d = new Date(iso);
  return d.toLocaleString(undefined, {
    weekday: "short",
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit"
  });
}

export function EventRenderer({
  event,
  preview,
  children
}: {
  event: EventViewModel;
  preview?: boolean;
  children?: React.ReactNode;
}) {
  const { rootClass, fontClass, headingClass } = themeClasses(event.theme);
  const heroLayout = event.theme.layoutStyle === "modern" ? "split" : "center";
  const anim = motionPreset(event.theme.animationStyle);
  const ended = event.status === "ended";

  const headline =
    event.type === "wedding" && event.coupleDetails
      ? `${event.coupleDetails.bride.name} & ${event.coupleDetails.groom.name}`
      : event.hostDetails?.hostName?.trim()
        ? event.hostDetails.hostName
        : event.title;

  const hostPeople =
    event.type !== "wedding" ? event.hostDetails?.hosts?.filter((p) => p.name.trim()) : [];

  return (
    <div
      className={cn(rootClass, fontClass, "min-h-screen bg-background text-foreground")}
      style={themeCssVars(event.theme)}
    >
      <div className="mx-auto max-w-5xl px-4 py-10">
        <motion.header
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={anim as any}
          className={cn(
            "overflow-hidden rounded-3xl border bg-card shadow-soft",
            heroLayout === "split" ? "md:grid md:grid-cols-2" : ""
          )}
        >
          <div className={cn("p-8 md:p-12", heroLayout === "split" ? "" : "text-center")}>
            <div className={cn("text-[10px] font-semibold uppercase tracking-[0.4em] opacity-60", headingClass)}>
              {event.theme.headingText}
            </div>
            <div className="mt-5 text-sm font-medium uppercase tracking-widest text-primary/80">
              {event.type} • {event.title || "Event"}
            </div>
            <h1 className={cn("mt-3 text-balance text-4xl font-semibold tracking-tight md:text-5xl", headingClass)}>
              {headline || "Celebration"}
            </h1>
            <p className="mt-4 text-pretty text-muted-foreground">
              {event.description?.trim()
                ? event.description
                : "Join us for a beautiful celebration. Scroll for details, countdown, and RSVP."}
            </p>

            {event.type !== "wedding" && event.hostDetails?.hostName?.trim() ? (
              <div className="mt-5 rounded-2xl border bg-muted p-4 text-sm text-muted-foreground">
                <div className="font-medium text-foreground">Hosted by</div>
                <div className="mt-1">{event.hostDetails.hostName}</div>
                {hostPeople?.length ? (
                  <div className="mt-3 grid gap-1">
                    {hostPeople.slice(0, 6).map((p, idx) => (
                      <div key={idx} className="flex items-center justify-between gap-3">
                        <span className="text-foreground">{p.name}</span>
                        {p.role?.trim() ? <span className="text-xs">{p.role}</span> : null}
                      </div>
                    ))}
                  </div>
                ) : null}
              </div>
            ) : null}

            <div
              className={cn(
                "mt-6 flex flex-wrap items-center gap-3",
                heroLayout === "split" ? "" : "justify-center"
              )}
            >
              <MusicToggle musicUrl={event.musicUrl} />
              {event.slug ? (
                <Link
                  className="inline-flex items-center gap-2 rounded-xl border bg-muted px-3 py-2 text-sm text-muted-foreground hover:text-foreground"
                  href={`/event/${event.slug}`}
                  prefetch={false}
                >
                  <LinkIcon className="h-4 w-4" /> /event/{event.slug}
                </Link>
              ) : null}
            </div>

            {ended ? (
              <div className="mt-6 rounded-2xl border bg-muted p-4 text-sm text-muted-foreground">
                This event link has expired.
              </div>
            ) : (
              <div className="mt-6">
                <Countdown date={event.date} />
              </div>
            )}
          </div>

          {event.coverImageUrl ? (
            <div className="relative min-h-64">
              <Image
                alt="Cover"
                src={event.coverImageUrl}
                fill
                className="object-cover"
                sizes="(max-width: 768px) 100vw, 50vw"
                priority={!preview}
              />
            </div>
          ) : null}
        </motion.header>

        <motion.section
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ ...anim, delay: 0.1 } as any}
          className="mt-8 grid gap-4 md:grid-cols-2"
          id="details"
        >
          <div className="rounded-3xl border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-medium">
              <Calendar className="h-4 w-4" /> Date & time
            </div>
            <div className="mt-2 text-lg">{formatDateTime(event.date)}</div>
            <p className="mt-2 text-sm text-muted-foreground">
              Add to your calendar and arrive a little early.
            </p>
          </div>

          <div className="rounded-3xl border bg-card p-6 shadow-soft">
            <div className="flex items-center gap-2 text-sm font-medium">
              <MapPin className="h-4 w-4" /> Venue
            </div>
            <div className="mt-2 text-lg">
              {event.venue?.trim() ? event.venue : "Venue details"}
            </div>
            {event.mapLink?.trim() ? (
              <div className="mt-4">
                <Link
                  className="text-sm underline underline-offset-4"
                  href={event.mapLink}
                  target="_blank"
                  rel="noreferrer"
                >
                  Open in Google Maps
                </Link>
              </div>
            ) : null}
          </div>
        </motion.section>

        {!preview && children ? (
          <div className="mt-8 grid gap-6" id="interactive">
            {children}
          </div>
        ) : null}

        <footer className="mt-10 text-center text-xs text-muted-foreground">
          {preview ? "Live preview" : "Made with Online Invitations"}
        </footer>
      </div>
    </div>
  );
}
