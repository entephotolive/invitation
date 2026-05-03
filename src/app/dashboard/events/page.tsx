import Link from "next/link";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { listEventsForOwner } from "@/lib/eventsRepo";
import { Button } from "@/components/ui/button";

export default async function EventsPage() {
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  const events = ownerId ? await listEventsForOwner(ownerId) : [];

  return (
    <div className="grid gap-6">
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-semibold">Your events</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Create, edit, and share invitation pages.
          </p>
        </div>
        <Button asChild>
          <Link href="/dashboard/events/new">New event</Link>
        </Button>
      </div>

      <div className="grid gap-3">
        {events.map((event) => (
          <Link
            key={event._id}
            href={`/dashboard/events/${event._id}/edit`}
            className="rounded-2xl border bg-card p-4 shadow-soft transition hover:shadow"
          >
            <div className="flex items-start justify-between gap-4">
              <div>
                <div className="font-medium">{event.title || "Untitled"}</div>
                <div className="mt-1 text-sm text-muted-foreground">
                  /event/{event.slug} • {event.type}
                </div>
              </div>
              <span className="rounded-full border bg-muted px-2 py-1 text-xs text-muted-foreground">
                {event.status}
              </span>
            </div>
          </Link>
        ))}

        {events.length === 0 ? (
          <div className="rounded-2xl border bg-card p-8 text-center text-sm text-muted-foreground shadow-soft">
            No events yet. Create your first invitation.
          </div>
        ) : null}
      </div>
    </div>
  );
}
