import { createServerFn } from "@tanstack/react-start";
import { streamText, Output } from "ai";
import { z } from "zod";

import { getAiModel, aiProviderOptions, toFriendlyAiError } from "./ai-gateway.server";

const toneEnum = z.enum(["Formal", "Friendly", "Persuasive"]);

async function runStructured<T>(schema: z.ZodType<T>, system: string, prompt: string): Promise<T> {
  try {
    const result = streamText({
      model: getAiModel(),
      system,
      prompt,
      output: Output.object({ schema: schema as never }),
      providerOptions: aiProviderOptions as never,
    });
    return (await result.output) as T;
  } catch (error) {
    throw toFriendlyAiError(error);
  }
}

/* ---------------- Email ---------------- */

const EmailInput = z.object({
  intent: z.string().min(3),
  tone: toneEnum,
  recipient: z.string(),
  sender: z.string(),
});

const EmailOutput = z.object({
  subject: z.string(),
  body: z.string(),
});

export type GeneratedEmail = z.infer<typeof EmailOutput>;

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => EmailInput.parse(input))
  .handler(async ({ data }) =>
    runStructured(
      EmailOutput,
      "You write professional business emails. Match the requested tone exactly. Return a concise subject line and a complete email body with greeting and sign-off. Keep it under 180 words. Plain text only, no markdown.",
      [
        `Tone: ${data.tone}`,
        data.recipient ? `Recipient: ${data.recipient}` : "Recipient: unspecified",
        data.sender ? `Sender name for the sign-off: ${data.sender}` : "Sender: unspecified",
        `Intent: ${data.intent}`,
      ].join("\n"),
    ),
  );

/* ---------------- Meeting notes ---------------- */

const NotesInput = z.object({ notes: z.string().min(20) });

const NotesOutput = z.object({
  summary: z.string(),
  actionItems: z.array(z.object({ task: z.string(), owner: z.string() })),
  decisions: z.array(z.string()),
  deadlines: z.array(z.object({ label: z.string(), due: z.string() })),
});

export type MeetingDigest = z.infer<typeof NotesOutput>;

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => NotesInput.parse(input))
  .handler(async ({ data }) =>
    runStructured(
      NotesOutput,
      "You condense meeting notes. Write a 2-3 sentence summary, then extract action items with owners (use 'Unassigned' when unclear), decisions made, and deadlines with dates as written or inferred. Never invent items that are not implied by the notes.",
      data.notes,
    ),
  );

/* ---------------- Tasks ---------------- */

const TaskSeed = z.object({ id: z.string(), title: z.string(), note: z.string() });

const PrioritiseInput = z.object({ tasks: z.array(TaskSeed).min(1) });

const PrioritiseOutput = z.object({
  tasks: z.array(
    z.object({
      id: z.string(),
      title: z.string(),
      urgency: z.number(),
      impact: z.number(),
      bucket: z.enum(["Now", "Soon", "Later"]),
      reason: z.string(),
    }),
  ),
});

export type PrioritisedTasks = z.infer<typeof PrioritiseOutput>;

export const prioritiseTasks = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => PrioritiseInput.parse(input))
  .handler(async ({ data }) =>
    runStructured(
      PrioritiseOutput,
      "You are a prioritisation engine. Score each task for urgency (1-5) and impact (1-5), assign a bucket of Now, Soon or Later, and give a one-line reason. Return every task given, ordered from highest to lowest priority. Keep the original id.",
      JSON.stringify(data.tasks),
    ),
  );

/* ---------------- Schedule ---------------- */

const ScheduleInput = z.object({
  range: z.enum(["day", "week"]),
  tasks: z.array(z.object({ title: z.string(), bucket: z.string() })),
  context: z.string(),
});

const ScheduleOutput = z.object({
  blocks: z.array(
    z.object({
      day: z.string(),
      start: z.string(),
      duration: z.string(),
      title: z.string(),
      kind: z.enum(["focus", "meeting", "admin"]),
    }),
  ),
});

export type GeneratedSchedule = z.infer<typeof ScheduleOutput>;

export const generateSchedule = createServerFn({ method: "POST" })
  .inputValidator((input: unknown) => ScheduleInput.parse(input))
  .handler(async ({ data }) =>
    runStructured(
      ScheduleOutput,
      "You build realistic work schedules. Working hours are 09:00-17:30 with a lunch break. Protect deep-focus time in the morning for high-priority work. For a day plan use 'Today' as the day for every block. For a week plan use Mon-Fri and spread work sensibly. Times in 24h HH:MM, duration like '90 min'.",
      [
        `Range: ${data.range}`,
        data.context ? `Constraints: ${data.context}` : "",
        `Tasks: ${JSON.stringify(data.tasks)}`,
      ]
        .filter(Boolean)
        .join("\n"),
    ),
  );
