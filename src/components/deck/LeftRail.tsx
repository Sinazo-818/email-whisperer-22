import type { ScheduleBlock, Task } from "@/lib/workspace-store";

export function LeftRail({ tasks, blocks }: { tasks: Task[]; blocks: ScheduleBlock[] }) {
  const open = tasks.filter((task) => !task.done);
  const urgent = open.filter((task) => task.bucket === "Now").length;
  const soon = open.filter((task) => task.bucket === "Soon").length;
  const done = tasks.length - open.length;

  const dotFor = (kind: ScheduleBlock["kind"]) =>
    kind === "meeting" ? "bg-accent" : kind === "focus" ? "bg-primary" : "bg-foreground/30";

  return (
    <aside className="grid grid-cols-1 gap-5 sm:grid-cols-2 md:sticky md:top-5 md:grid-cols-1 md:self-start">
      <div className="deck-panel p-4">
        <div className="mb-3 label-mono">Today</div>
        <div className="flex items-baseline gap-2">
          <span className="font-display text-4xl tracking-tight">{open.length}</span>
          <span className="text-sm text-muted-foreground">open tasks</span>
        </div>
        <div className="mt-3 space-y-2 border-t border-border pt-3 text-xs">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Now</span>
            <span className="font-mono text-accent">{urgent}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Soon</span>
            <span className="font-mono">{soon}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Done</span>
            <span className="font-mono">{done}</span>
          </div>
        </div>
      </div>

      <div className="deck-panel p-4">
        <div className="mb-3 label-mono">Up next</div>
        {blocks.length === 0 ? (
          <p className="text-sm text-muted-foreground">
            No plan yet. Generate a schedule to fill this in.
          </p>
        ) : (
          <div className="space-y-3 text-sm">
            {blocks.slice(0, 4).map((block, index) => (
              <div key={`${block.day}-${block.start}-${index}`} className="flex gap-2">
                <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dotFor(block.kind)}`} />
                <div>
                  <div className="font-medium leading-tight">{block.title}</div>
                  <div className="font-mono text-[10px] text-muted-foreground">
                    {block.day} {block.start} · {block.duration}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </aside>
  );
}
