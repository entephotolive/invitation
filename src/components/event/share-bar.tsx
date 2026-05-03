"use client";

import { useEffect, useMemo, useState } from "react";
import QRCode from "qrcode";
import { Copy, MessageCircle, QrCode } from "lucide-react";
import { Button } from "@/components/ui/button";

export function ShareBar({ slug, title }: { slug: string; title?: string }) {
  const [url, setUrl] = useState<string>("");
  const [qr, setQr] = useState<string>("");
  const [showQr, setShowQr] = useState(false);

  useEffect(() => {
    const origin =
      typeof window !== "undefined" ? window.location.origin : "";
    setUrl(`${origin}/event/${slug}`);
  }, [slug]);

  useEffect(() => {
    if (!url || !showQr) return;
    QRCode.toDataURL(url, { margin: 1, width: 220 })
      .then(setQr)
      .catch(() => setQr(""));
  }, [showQr, url]);

  const waHref = useMemo(() => {
    const text = title ? `${title}\n${url}` : url;
    return `https://wa.me/?text=${encodeURIComponent(text)}`;
  }, [title, url]);

  async function copy() {
    if (!url) return;
    try {
      await navigator.clipboard.writeText(url);
    } catch {
      // ignore
    }
  }

  return (
    <div className="rounded-3xl border bg-card p-6 shadow-soft">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <div className="text-sm font-medium">Share</div>
          <div className="mt-1 text-sm text-muted-foreground">
            Send your invitation via QR or WhatsApp.
          </div>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button variant="secondary" type="button" onClick={copy}>
            <Copy className="h-4 w-4" /> Copy link
          </Button>
          <Button asChild variant="secondary">
            <a href={waHref} target="_blank" rel="noreferrer">
              <MessageCircle className="h-4 w-4" /> WhatsApp
            </a>
          </Button>
          <Button
            variant="secondary"
            type="button"
            onClick={() => setShowQr((v) => !v)}
          >
            <QrCode className="h-4 w-4" /> {showQr ? "Hide" : "QR code"}
          </Button>
        </div>
      </div>
      {showQr ? (
        <div className="mt-5 flex justify-center">
          {qr ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img src={qr} alt="QR code" className="rounded-2xl border" />
          ) : (
            <div className="text-sm text-muted-foreground">Generating…</div>
          )}
        </div>
      ) : null}
    </div>
  );
}

