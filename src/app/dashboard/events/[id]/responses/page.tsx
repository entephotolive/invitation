import { notFound } from "next/navigation";
import { getEventByIdForOwner, listRsvpsForEvent } from "@/lib/eventsRepo";

const DEFAULT_USER_ID = "default-user";

export default async function ResponsesPage({
  params
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  const event = await getEventByIdForOwner(id, DEFAULT_USER_ID);
  if (!event) notFound();

  const rsvps = await listRsvpsForEvent(event._id);

  return (
    <div className="grid gap-4">
      <div>
        <h1 className="text-2xl font-semibold">RSVP responses</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          {event.title || "Untitled"} • /event/{event.slug}
        </p>
      </div>

      <div className="overflow-hidden rounded-2xl border bg-card shadow-soft">
        <table className="w-full text-sm">
          <thead className="bg-muted text-left text-muted-foreground">
            <tr>
              <th className="px-4 py-3">Name</th>
              <th className="px-4 py-3">Attending</th>
              <th className="px-4 py-3">Guests</th>
              <th className="px-4 py-3">Message</th>
            </tr>
          </thead>
          <tbody>
            {rsvps.map((r) => (
              <tr key={r._id} className="border-t">
                <td className="px-4 py-3">{r.name}</td>
                <td className="px-4 py-3">{r.attending ? "Yes" : "No"}</td>
                <td className="px-4 py-3">{r.guestsCount}</td>
                <td className="px-4 py-3 text-muted-foreground">
                  {r.message || "-"}
                </td>
              </tr>
            ))}
            {rsvps.length === 0 ? (
              <tr className="border-t">
                <td className="px-4 py-8 text-center text-muted-foreground" colSpan={4}>
                  No RSVPs yet.
                </td>
              </tr>
            ) : null}
          </tbody>
        </table>
      </div>
    </div>
  );
}
