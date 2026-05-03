import { notFound } from "next/navigation";
import { EventRenderer } from "@/components/event/event-renderer";
import { getPublicEventBySlug } from "@/lib/eventsRepo";
import { ShareBar } from "@/components/event/share-bar";
import { RSVPForm } from "@/components/event/rsvp-form";
import { Wishes } from "@/components/event/wishes";
import { defaultThemeForReligion } from "@/themes/presets";

function demoEvent(slug: string) {
  if (slug !== "demo-wedding") return null;
  const date = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000);
  date.setHours(18, 0, 0, 0);
  return {
    slug,
    type: "wedding" as const,
    title: "Wedding Invitation",
    date: date.toISOString(),
    venue: "The Grand Ballroom • MG Road, Bengaluru",
    mapLink: "https://maps.google.com",
    description:
      "With great joy, we invite you to celebrate our wedding. Your presence will make our day complete.",
    theme: defaultThemeForReligion("hindu"),
    coupleDetails: {
      bride: { name: "Diya", parents: { father: "Ravi", mother: "Anita" } },
      groom: { name: "Aarav", parents: { father: "Vikram", mother: "Meera" } }
    },
    coverImageUrl:
      "https://res.cloudinary.com/demo/image/upload/v1690000000/sample.jpg",
    musicUrl: "",
    status: "active" as const
  };
}

export default async function EventPage({
  params
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const demo = demoEvent(slug);
  if (demo) {
    return (
      <EventRenderer event={demo}>
        <ShareBar slug={slug} title={demo.title} />
        <RSVPForm slug={slug} />
        <Wishes slug={slug} />
      </EventRenderer>
    );
  }

  const event = await getPublicEventBySlug(slug);
  if (!event) notFound();
  const ended = event.status === "ended";

  return (
    <EventRenderer
      event={{
        slug: event.slug,
        type: event.type,
        title: event.title,
        date: event.date,
        venue: event.venue,
        mapLink: event.mapLink,
        description: event.description,
        theme: event.theme,
        coupleDetails: event.coupleDetails,
        hostDetails: event.hostDetails,
        coverImageUrl: event.coverImage?.url || "",
        musicUrl: event.music?.url || "",
        status: event.status
      }}
    >
      <ShareBar slug={slug} title={event.title} />
      <RSVPForm slug={slug} disabled={ended} />
      <Wishes slug={slug} disabled={ended} />
    </EventRenderer>
  );
}
