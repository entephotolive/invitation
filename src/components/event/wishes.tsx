"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";

type Wish = {
  _id: string;
  name: string;
  message: string;
  createdAt: string;
};

export function Wishes({ slug, disabled }: { slug: string; disabled?: boolean }) {
  const [items, setItems] = useState<Wish[]>([]);
  const [loading, setLoading] = useState(true);
  const [name, setName] = useState("");
  const [message, setMessage] = useState("");
  const [sending, setSending] = useState(false);

  async function refresh() {
    setLoading(true);
    try {
      const res = await fetch(`/api/event/${encodeURIComponent(slug)}/wishes`);
      const json = await res.json();
      setItems(Array.isArray(json.wishes) ? json.wishes : []);
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => {
    refresh();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [slug]);

  async function submit() {
    setSending(true);
    try {
      const res = await fetch(`/api/event/${encodeURIComponent(slug)}/wishes`, {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ name, message })
      });
      if (res.ok) {
        setName("");
        setMessage("");
        await refresh();
      }
    } finally {
      setSending(false);
    }
  }

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-soft">
      <div className="flex items-start justify-between gap-4">
        <div>
          <div className="text-sm font-medium">Guest wishes</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Leave a message for the hosts.
          </div>
        </div>
        <Button variant="ghost" type="button" onClick={refresh}>
          Refresh
        </Button>
      </div>

      {disabled ? (
        <div className="mt-4 rounded-2xl border bg-muted p-4 text-sm text-muted-foreground">
          Wishes are closed.
        </div>
      ) : (
        <div className="mt-5 grid gap-3">
          <div className="grid gap-1">
            <label className="text-sm font-medium">Your name</label>
            <Input value={name} onChange={(e) => setName(e.target.value)} />
          </div>
          <div className="grid gap-1">
            <label className="text-sm font-medium">Wish</label>
            <Textarea
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Congratulations!"
            />
          </div>
          <div className="flex justify-end">
            <Button
              type="button"
              onClick={submit}
              disabled={sending || !name.trim() || !message.trim()}
            >
              {sending ? "Sending…" : "Send wish"}
            </Button>
          </div>
        </div>
      )}

      <div className="mt-6 grid gap-3">
        {loading ? (
          <div className="text-sm text-muted-foreground">Loading…</div>
        ) : items.length === 0 ? (
          <div className="text-sm text-muted-foreground">
            No wishes yet. Be the first!
          </div>
        ) : (
          items.map((w) => (
            <div key={w._id} className="rounded-2xl border bg-background p-4">
              <div className="text-sm font-medium">{w.name}</div>
              <div className="mt-1 text-sm text-muted-foreground">{w.message}</div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}

