import { EventEditor } from "@/components/event/event-editor";

export default function NewEventPage() {
  return (
    <div className="grid gap-6">
      <div>
        <h1 className="text-2xl font-semibold">Create event</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Fill details, pick a theme, and preview live.
        </p>
      </div>
      <EventEditor mode="create" />
    </div>
  );
}

