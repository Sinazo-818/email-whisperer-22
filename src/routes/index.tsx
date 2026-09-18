import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

import { CommandBar, type SectionId } from "@/components/deck/CommandBar";
import { EmailPanel } from "@/components/deck/EmailPanel";
import { LeftRail } from "@/components/deck/LeftRail";
import { MeetingsPanel } from "@/components/deck/MeetingsPanel";
import { SchedulePanel } from "@/components/deck/SchedulePanel";
import { TasksPanel } from "@/components/deck/TasksPanel";
import { TopBar } from "@/components/deck/TopBar";
import {
  newId,
  useLocalState,
  type Digest,
  type EmailDraft,
  type ScheduleBlock,
  type Task,
} from "@/lib/workspace-store";

const title = "daybreak — write, summarize, plan and prioritise";
const description =
  "A calm workspace that drafts professional emails in any tone, turns long meeting notes into action items, decisions and deadlines, and builds prioritised daily or weekly plans.";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title },
      { name: "description", content: description },
      { property: "og:title", content: title },
      { property: "og:description", content: description },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
    ],
  }),
  component: Workspace,
});

const emptyEmail: EmailDraft = {
  tone: "Formal",
  intent: "",
  recipient: "",
  sender: "",
  subject: "",
  body: "",
};

function Workspace() {
  const [active, setActive] = useState<SectionId>("email");
  const [tasks, setTasks] = useLocalState<Task[]>("daybreak.tasks", []);
  const [email, setEmail] = useLocalState<EmailDraft>("daybreak.email", emptyEmail);
  const [digest, setDigest] = useLocalState<Digest | null>("daybreak.digest", null);
  const [blocks, setBlocks] = useLocalState<ScheduleBlock[]>("daybreak.schedule", []);

  const focus = (id: SectionId) => {
    setActive(id);
    document.getElementById(id)?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  return (
    <div className="bg-scene min-h-screen text-foreground">
      <div className="mx-auto max-w-[1400px] px-5 py-6">
        <TopBar />
        <CommandBar active={active} onSelect={focus} />

        <div className="grid grid-cols-1 gap-5 lg:grid-cols-[236px_minmax(0,1fr)]">
          <LeftRail tasks={tasks} blocks={blocks} />

          <main className="space-y-5">
            <EmailPanel draft={email} onChange={setEmail} />

            <MeetingsPanel
              digest={digest}
              onDigest={setDigest}
              onSendActionsToTasks={(items) =>
                setTasks((prev) => [
                  ...prev,
                  ...items.map((item) => ({
                    id: newId(),
                    title: item.task,
                    note: `Owner: ${item.owner}`,
                    urgency: 3,
                    impact: 3,
                    bucket: "Soon" as const,
                    reason: "",
                    done: false,
                  })),
                ])
              }
            />

            <div className="grid grid-cols-1 gap-5 xl:grid-cols-2">
              <SchedulePanel blocks={blocks} onBlocks={setBlocks} tasks={tasks} />
              <TasksPanel tasks={tasks} onTasks={setTasks} />
            </div>
          </main>
        </div>
      </div>
    </div>
  );
}
