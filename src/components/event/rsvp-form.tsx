"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

export function RSVPForm({ slug, disabled }: { slug: string; disabled?: boolean }) {
  const [name, setName] = useState("");
  const [contact, setContact] = useState("");
  const [attending, setAttending] = useState(true);
  const [guestsCount, setGuestsCount] = useState(1);
  const [message, setMessage] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">(
    "idle"
  );

  async function submit() {
    setStatus("sending");
    try {
      const res = await fetch(`/api/event/${encodeURIComponent(slug)}/rsvp`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({
          name,
          contact,
          attending,
          guestsCount,
          message
        })
      });
      if (!res.ok) throw new Error(await res.text());
      setStatus("sent");
    } catch {
      setStatus("error");
    }
  }

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-soft">
      <div className="text-sm font-medium">RSVP</div>
      <div className="mt-1 text-sm text-muted-foreground">
        Let the hosts know if you can make it.
      </div>

      {disabled ? (
        <div className="mt-4 rounded-2xl border bg-muted p-4 text-sm text-muted-foreground">
          RSVPs are closed.
        </div>
      ) : status === "sent" ? (
        <div className="mt-4 rounded-2xl border bg-muted p-4 text-sm text-muted-foreground">
          Thanks! Your response has been recorded.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Your name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Contact (optional)</label>
            <Input
              value={contact}
              onChange={(e) => setContact(e.target.value)}
              placeholder="Phone or email"
            />
          </div>
          <div className="grid gap-2">
            <label className="text-sm font-medium">Attending?</label>
            <div className="flex gap-2">
              <Button
                type="button"
                variant={attending ? "primary" : "secondary"}
                onClick={() => setAttending(true)}
              >
                Yes
              </Button>
              <Button
                type="button"
                variant={!attending ? "primary" : "secondary"}
                onClick={() => setAttending(false)}
              >
                No
              </Button>
            </div>
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Guests</label>
            <Input
              type="number"
              min={0}
              max={20}
              value={guestsCount}
              onChange={(e) => setGuestsCount(Number(e.target.value))}
            />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Message (optional)</label>
            <Textarea value={message} onChange={(e) => setMessage(e.target.value)} />
          </div>

          {status === "error" ? (
            <div className="rounded-2xl border border-red-200 bg-red-50 p-3 text-sm text-red-700">
              Couldn’t submit. Please try again.
            </div>
          ) : null}

          <div className="flex justify-end">
            <Button
              type="button"
              onClick={submit}
              disabled={status === "sending" || !name.trim()}
            >
              {status === "sending" ? "Sending…" : "Submit RSVP"}
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}

