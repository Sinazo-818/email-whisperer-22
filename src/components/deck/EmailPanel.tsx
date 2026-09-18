import { useServerFn } from "@tanstack/react-start";
import { useMutation } from "@tanstack/react-query";
import { toast } from "sonner";

import { generateEmail } from "@/lib/workspace.functions";
import type { EmailDraft } from "@/lib/workspace-store";

const tones = ["Formal", "Friendly", "Persuasive"] as const;

export function EmailPanel({
  draft,
  onChange,
}: {
  draft: EmailDraft;
  onChange: (next: EmailDraft) => void;
}) {
  const run = useServerFn(generateEmail);

  const mutation = useMutation({
    mutationFn: () =>
      run({
        data: {
          intent: draft.intent,
          tone: draft.tone,
          recipient: draft.recipient,
          sender: draft.sender,
        },
      }),
    onSuccess: (result) => onChange({ ...draft, subject: result.subject, body: result.body }),
    onError: (error: Error) => toast.error(error.message),
  });

  return (
    <section id="email" className="deck-panel scroll-mt-24 p-5">
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2">
          <span className="font-mono text-[10px] text-primary">(a)</span>
          <h2 className="font-display text-xl tracking-tight">Draft an email</h2>
        </div>
        <div className="flex items-center gap-1 rounded-lg border border-border p-1">
          {tones.map((tone) => (
            <button
              key={tone}
              onClick={() => onChange({ ...draft, tone })}
              className={
                draft.tone === tone
                  ? "rounded-md bg-foreground px-2.5 py-1 text-xs font-medium text-surface"
                  : "rounded-md px-2.5 py-1 text-xs font-medium text-muted-foreground transition-colors hover:text-foreground"
              }
            >
              {tone}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-3 grid gap-2 sm:grid-cols-2">
        <input
          value={draft.recipient}
          onChange={(event) => onChange({ ...draft, recipient: event.target.value })}
          placeholder="Recipient (e.g. Mr. Okafor, client)"
          className="deck-inset px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
        <input
          value={draft.sender}
          onChange={(event) => onChange({ ...draft, sender: event.target.value })}
          placeholder="Your name for the sign-off"
          className="deck-inset px-3 py-2.5 text-sm outline-none placeholder:text-muted-foreground focus:ring-2 focus:ring-ring"
        />
      </div>

      <div className="mb-4 deck-inset p-3">
        <span className="label-mono">Intent</span>
        <textarea
          value={draft.intent}
          onChange={(event) => onChange({ ...draft, intent: event.target.value })}
          rows={3}
          placeholder="Ask the client to approve the revised timeline by Friday"
          className="mt-2 w-full resize-none bg-transparent text-sm outline-none placeholder:text-muted-foreground"
        />
        <div className="mt-2 flex justify-end">
          <button
            onClick={() => mutation.mutate()}
            disabled={mutation.isPending || draft.intent.trim().length < 3}
            className="rounded-md bg-primary px-3 py-1.5 text-xs font-medium text-primary-foreground transition-opacity duration-200 hover:opacity-90 disabled:opacity-50"
          >
            {mutation.isPending ? "Writing…" : "Generate email"}
          </button>
        </div>
      </div>

      <div className="deck-inset p-4">
        <div className="mb-3 flex items-center justify-between">
          <span className="label-mono">Generated · {draft.tone}</span>
          <button
            onClick={() => {
              void navigator.clipboard.writeText(`Subject: ${draft.subject}\n\n${draft.body}`);
              toast.success("Email copied");
            }}
            disabled={!draft.body}
            className="rounded-md border border-border px-3 py-1 text-xs font-medium transition-colors duration-200 hover:bg-foreground hover:text-surface disabled:opacity-40"
          >
            Copy
          </button>
        </div>
        {draft.body ? (
          <div className="space-y-2 text-sm leading-relaxed text-foreground/90">
            <p className="font-medium">Subject: {draft.subject}</p>
            {draft.body.split("\n").filter(Boolean).map((line, index) => (
              <p key={index}>{line}</p>
            ))}
          </div>
        ) : (
          <p className="text-sm text-muted-foreground">
            Describe what you need to say and pick a tone — the draft appears here.
          </p>
        )}
      </div>
    </section>
  );
}
