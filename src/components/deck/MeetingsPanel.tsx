import { useState } from "react";
import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { summarizeNotes } from "@/lib/workspace.functions";
import type { Digest } from "@/lib/workspace-store";

export function MeetingsPanel({
  digest,
  onDigest,
  onSendActionsToTasks,
}: {
  digest: Digest | null;
  onDigest: (next: Digest) => void;
  onSendActionsToTasks: (items: { task: string; owner: string }[]) => void;
}) {
  const [notes, setNotes] = useState("");
  const [title, setTitle] = useState("");
  const run = useServerFn(summarizeNotes);

  const mutation = useMutation({
    mutationFn: () => run({ data: { notes } }),
    onSuccess: (result) => onDigest({ title: title.trim() || "Untitled meeting", ...result }),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section id="meetings" className="deck-panel scroll-mt-24 p-5">
      <div className="mb-4 flex flex-wrap items-center gap-2">
        <span className="font-mono text-[10px] text-primary">(b)</span>
        <h2 className="font-display text-xl tracking-tight">Meeting summary</h2>
        <span className="ml-auto label-mono">{digest ? digest.title : "Paste your notes"}</span>
      </div>

      <div className="mb-4 space-y-2">
        <input
          value={title}
          onChange={(event) => setTitle(event.target.value)}
          placeholder="Meeting name"
          className="deck-inset w-full px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <textarea
          value={notes}
          onChange={(event) => setNotes(event.target.value)}
          rows={5}
          placeholder="Paste the raw meeting notes or transcript here…"
          className="deck-inset w-full resize-none px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <div className="flex justify-end">
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || notes.trim().length < 20}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? "Reading notes…" : "Summarize"}
          </button>
        </div>
      </div>

      {digest ? (
        <>
          <p className="mb-4 text-sm leading-relaxed text-foreground/80">{digest.summary}</p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="deck-inset p-3">
              <div className="mb-2 label-mono !text-accent">Action items</div>
              <ul className="space-y-1.5 text-xs">
                {digest.actionItems.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-foreground/40">·</span>
                    {item.task} — {item.owner}
                  </li>
                ))}
              </ul>
              {digest.actionItems.length > 0 && (
                <button
                  onClick={() => {
                    onSendActionsToTasks(digest.actionItems);
                    toast.success("Action items added to tasks");
                  }}
                  className="mt-3 rounded-md border border-border px-2.5 py-1 text-[11px] font-medium transition-colors duration-200 hover:bg-foreground hover:text-surface"
                >
                  Add to tasks
                </button>
              )}
            </div>
            <div className="deck-inset p-3">
              <div className="mb-2 label-mono !text-primary">Decisions</div>
              <ul className="space-y-1.5 text-xs">
                {digest.decisions.map((item, index) => (
                  <li key={index} className="flex gap-2">
                    <span className="text-foreground/40">·</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="deck-inset p-3">
              <div className="mb-2 label-mono !text-foreground">Deadlines</div>
              <ul className="space-y-1.5 text-xs">
                {digest.deadlines.map((item, index) => (
                  <li key={index} className="flex justify-between gap-2">
                    <span>{item.label}</span>
                    <span className="font-mono text-muted-foreground">{item.due}</span>
                  </li>
                ))}
              </ul>
            </div>
          </div>
        </>
      ) : (
        <p className="text-sm text-muted-foreground">
          The summary, action items, decisions and deadlines will appear here.
        </p>
      )}
    </section>
  );
}
