import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { generateSchedule } from "@/lib/workspace.functions";
import type { ScheduleBlock, Task } from "@/lib/workspace-store";

export function SchedulePanel({
  blocks,
  onBlocks,
  tasks,
}: {
  blocks: ScheduleBlock[];
  onBlocks: (next: ScheduleBlock[]) => void;
  tasks: Task[];
}) {
  const [range, setRange] = useState<"day" | "week">("day");
  const [context, setContext] = useState("");
  const run = useServerFn(generateSchedule);

  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          range,
          context,
          tasks: tasks
            .filter((task) => !task.done)
            .map((task) => ({ title: task.title, bucket: task.bucket })),
        },
      }),
    onSuccess: (result) => onBlocks(result.blocks),
    onError: (error: Error) => toast.error(error.message),
  });

  const dotFor = (kind: ScheduleBlock["kind"]) =>
    kind === "meeting" ? "bg-accent" : kind === "focus" ? "bg-primary" : "bg-foreground/30";

  return (
    <section id="schedule" className="deck-panel scroll-mt-24 p-5">
      <div className="mb-4 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-primary">(c)</span>
          <h2 className="font-display text-xl tracking-tight">Schedule</h2>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {(["day", "week"] as const).map((option) => (
            <button
              key={option}
              onClick={() => setRange(option)}
              className={
                range === option
                  ? "rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-surface capitalize"
                  : "rounded-md px-2.5 py-1 text-xs font-medium capitalize text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {option}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={context}
          onChange={(event) => setContext(event.target.value)}
          placeholder="Fixed commitments, e.g. standup 09:15, no meetings after 16:00"
          className="deck-inset flex-1 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || tasks.filter((task) => !task.done).length === 0}
          className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
        >
          {mutation.isPending ? "Planning…" : "Generate"}
        </button>
      </div>

      {blocks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Add a few tasks, then generate a {range} plan built around them.
        </p>
      ) : (
        <div className="space-y-2">
          {blocks.map((block, index) => (
            <div
              key={`${block.day}-${block.start}-${index}`}
              className="deck-inset flex gap-3 p-3 transition-colors duration-200 hover:border-foreground/20"
            >
              <span className="w-24 shrink-0 font-mono text-xs text-muted-foreground">
                {block.day} {block.start}
              </span>
              <span className={`mt-1.5 size-1.5 shrink-0 rounded-full ${dotFor(block.kind)}`} />
              <div className="text-sm">
                <div className="font-medium leading-tight">{block.title}</div>
                <div className="font-mono text-[10px] text-muted-foreground">
                  {block.duration} · {block.kind}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
