import { notFound } from "next/navigation";
import { getServerSession } from "next-auth";
import { authOptions } from "@/lib/auth";
import { getEventByIdForOwner } from "@/lib/eventsRepo";
import { EventEditor } from "@/components/event/event-editor";

export default async function EditEventPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await getServerSession(authOptions);
  const ownerId = session?.user?.id;
  if (!ownerId) notFound();

  const event = await getEventByIdForOwner(id, ownerId);
  if (!event) notFound();

  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Edit event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Update content and share the link.
        </p>
      </div>
      <EventEditor mode="edit" initialEvent={event} />
    </div>
  );
}

