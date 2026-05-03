"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { Volume2, VolumeX } from "lucide-react";
import { Button } from "@/components/ui/button";

export function MusicToggle({ musicUrl }: { musicUrl?: string }) {
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const [enabled, setEnabled] = useState(false);

  const url = useMemo(() => (musicUrl && musicUrl.length > 0 ? musicUrl : ""), [musicUrl]);

  useEffect(() => {
    if (!url) return;
    audioRef.current = new Audio(url);
    audioRef.current.loop = true;
    audioRef.current.volume = 0.65;
    return () => {
      audioRef.current?.pause();
      audioRef.current = null;
    };
  }, [url]);

  async function toggle() {
    if (!audioRef.current) return;
    if (enabled) {
      audioRef.current.pause();
      setEnabled(false);
      return;
    }
    try {
      await audioRef.current.play();
      setEnabled(true);
    } catch {
      setEnabled(false);
    }
  }

  if (!url) return null;

  return (
    <Button variant="secondary" type="button" onClick={toggle}>
      {enabled ? (
        <>
          <Volume2 className="h-4 w-4" /> Music on
        </>
      ) : (
        <>
          <VolumeX className="h-4 w-4" /> Music off
        </>
      )}
    </Button>
  );
}

