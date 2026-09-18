const sections = [
  { id: "email", label: "Email" },
  { id: "meetings", label: "Meetings" },
  { id: "schedule", label: "Schedule" },
  { id: "tasks", label: "Tasks" },
] as const;

export type SectionId = (typeof sections)[number]["id"];

export function CommandBar({
  active,
  onSelect,
}: {
  active: SectionId;
  onSelect: (id: SectionId) => void;
}) {
  return (
    <div className="mb-5 flex flex-wrap items-center gap-2 rounded-xl border border-border bg-surface/55 px-3 py-2.5 backdrop-blur">
      <span className="label-mono">Command</span>
      <span className="h-4 w-px bg-border" />
      {sections.map((section) => (
        <button
          key={section.id}
          onClick={() => onSelect(section.id)}
          className={
            active === section.id
              ? "rounded-md bg-foreground px-3 py-1.5 text-xs font-medium text-surface transition-colors duration-200"
              : "rounded-md px-3 py-1.5 text-xs font-medium text-muted-foreground transition-colors duration-200 hover:bg-foreground/5 hover:text-foreground"
          }
        >
          {section.label}
        </button>
      ))}
      <div className="ml-auto hidden items-center gap-1 rounded-md border border-border px-2 py-1 font-mono text-[10px] text-muted-foreground sm:flex">
        Everything saves in this browser
      </div>
    </div>
  );
}
