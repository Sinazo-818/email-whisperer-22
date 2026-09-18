import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { prioritiseTasks } from "@/lib/workspace.functions";
import { newId, type Task } from "@/lib/workspace-store";

export function TasksPanel({
  tasks,
  onTasks,
}: {
  tasks: Task[];
  onTasks: (next: Task[] | ((prev: Task[]) => Task[])) => void;
}) {
  const [title, setTitle] = useState("");
  const run = useServerFn(prioritiseTasks);

  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          tasks: tasks
            .filter((task) => !task.done)
            .map((task) => ({ id: task.id, title: task.title, note: task.note })),
        },
      }),
    onSuccess: (result) => {
      const ranked = result.tasks;
      onTasks((prev) => {
        const byId = new Map(prev.map((task) => [task.id, task]));
        const updated: Task[] = [];
        for (const scored of ranked) {
          const existing = byId.get(scored.id);
          if (!existing) continue;
          updated.push({
            ...existing,
            urgency: scored.urgency,
            impact: scored.impact,
            bucket: scored.bucket,
            reason: scored.reason,
          });
          byId.delete(scored.id);
        }
        return [...updated, ...byId.values()];
      });
      toast.success("Tasks reprioritised");
    },
    onError: (error: Error) => toast.error(error.message),
  });

  const add = () => {
    const value = title.trim();
    if (!value) return;
    onTasks((prev) => [
      ...prev,
      {
        id: newId(),
        title: value,
        note: "",
        urgency: 3,
        impact: 3,
        bucket: "Soon",
        reason: "",
        done: false,
      },
    ]);
    setTitle("");
  };

  const bucketClass = (bucket: Task["bucket"]) =>
    bucket === "Now"
      ? "bg-accent/15 text-accent"
      : bucket === "Soon"
        ? "bg-primary/15 text-primary"
        : "bg-foreground/8 text-muted-foreground";

  return (
    <section id="tasks" className="deck-panel scroll-mt-24 p-5">
      <div className="mb-4 flex items-center gap-2">
        <span className="font-mono text-[10px] text-primary">(d)</span>
        <h2 className="font-display text-xl tracking-tight">Prioritised tasks</h2>
        <button
          onClick={() => mutation.mutate()}
          disabled={mutation.isPending || tasks.filter((task) => !task.done).length === 0}
          className="ml-auto rounded-md border border-border px-3 py-1 text-xs font-medium transition-colors duration-200 hover:bg-foreground hover:text-surface disabled:opacity-40"
        >
          {mutation.isPending ? "Ranking…" : "Prioritise"}
        </button>
      </div>

      <div className="mb-4 flex gap-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          onKeyDown={(event) => event.key === "Enter" && add()}
          placeholder="Add a task"
          className="deck-inset flex-1 px-3 py-2 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <button
          onClick={add}
          className="rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-surface transition-colors duration-200 hover:bg-primary"
        >
          Add
        </button>
      </div>

      {tasks.length === 0 ? (
        <p className="text-sm text-muted-foreground">
          Nothing here yet. Add tasks, or pull action items from a meeting summary.
        </p>
      ) : (
        <div className="space-y-2">
          {tasks.map((task) => (
            <div
              key={task.id}
              className="deck-inset flex items-center gap-3 p-3 transition-colors duration-200 hover:border-foreground/20"
            >
              <button
                aria-label={task.done ? "Mark as not done" : "Mark as done"}
                onClick={() =>
                  onTasks((prev) =>
                    prev.map((item) =>
                      item.id === task.id ? { ...item, done: !item.done } : item,
                    ),
                  )
                }
                className={`grid size-4 shrink-0 place-items-center rounded border border-foreground/30 ${
                  task.done ? "bg-foreground" : ""
                }`}
              />
              <div className="min-w-0 flex-1">
                <div
                  className={`truncate text-sm font-medium ${task.done ? "text-muted-foreground line-through" : ""}`}
                >
                  {task.title}
                </div>
                <div className="truncate font-mono text-[10px] text-muted-foreground">
                  Urgency {task.urgency} · Impact {task.impact}
                  {task.reason ? ` · ${task.reason}` : ""}
                </div>
              </div>
              <span
                className={`shrink-0 rounded-full px-2 py-0.5 font-mono text-[10px] ${bucketClass(task.bucket)}`}
              >
                {task.bucket}
              </span>
              <button
                aria-label="Remove task"
                onClick={() => onTasks((prev) => prev.filter((item) => item.id !== task.id))}
                className="shrink-0 font-mono text-[11px] text-muted-foreground transition-colors hover:text-foreground"
              >
                ×
              </button>
            </div>
          ))}
        </div>
      )}
    </section>
  );
}
