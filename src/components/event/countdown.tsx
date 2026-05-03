"use client";

import { useEffect, useMemo, useState } from "react";

function pad(value: number) {
  return value.toString().padStart(2, "0");
}

export function Countdown({ date }: { date: string }) {
  const target = useMemo(() => new Date(date).getTime(), [date]);
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    const t = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(t);
  }, []);

  const diff = Math.max(0, target - now);
  const totalSeconds = Math.floor(diff / 1000);
  const days = Math.floor(totalSeconds / (60 * 60 * 24));
  const hours = Math.floor((totalSeconds / (60 * 60)) % 24);
  const minutes = Math.floor((totalSeconds / 60) % 60);
  const seconds = Math.floor(totalSeconds % 60);

  return (
    <div className="grid grid-cols-4 gap-2 rounded-2xl border bg-card p-4 shadow-soft">
      <div className="text-center">
        <div className="text-2xl font-semibold tabular-nums">{days}</div>
        <div className="text-xs text-muted-foreground">Days</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-semibold tabular-nums">{pad(hours)}</div>
        <div className="text-xs text-muted-foreground">Hours</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-semibold tabular-nums">{pad(minutes)}</div>
        <div className="text-xs text-muted-foreground">Minutes</div>
      </div>
      <div className="text-center">
        <div className="text-2xl font-semibold tabular-nums">{pad(seconds)}</div>
        <div className="text-xs text-muted-foreground">Seconds</div>
      </div>
    </div>
  );
}
