import { useEffect, useState } from "react";

function formatNow(date: Date) {
  return date.toLocaleString(undefined, {
    weekday: "short",
    day: "2-digit",
    month: "short",
    hour: "2-digit",
    minute: "2-digit",
    hour12: false,
  });
}

export function TopBar() {
  const [now, setNow] = useState<string>("");

  useEffect(() => {
    setNow(formatNow(new Date()));
    const timer = setInterval(() => setNow(formatNow(new Date())), 30_000);
    return () => clearInterval(timer);
  }, []);

  return (
    <header className="mb-6 flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="grid size-9 place-items-center rounded-lg bg-foreground font-display text-lg italic text-surface">
          d
        </div>
        <div>
          <div className="font-display text-lg leading-none tracking-tight">daybreak</div>
          <div className="label-mono">workspace</div>
        </div>
      </div>
      <div className="flex items-center gap-3">
        <div className="rounded-lg border border-border bg-surface/60 px-3 py-2 font-mono text-xs text-muted-foreground backdrop-blur">
          {now || "—"}
        </div>
        <div className="grid size-9 place-items-center rounded-full bg-primary font-mono text-xs font-medium text-primary-foreground">
          EV
        </div>
      </div>
    </header>
  );
}
