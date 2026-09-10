import { Idea } from "./types";

function dateLabel(iso: string): string {
  const date = new Date(iso);
  const today = new Date();
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  const isSameDay = (a: Date, b: Date) =>
    a.getFullYear() === b.getFullYear() &&
    a.getMonth() === b.getMonth() &&
    a.getDate() === b.getDate();

  if (isSameDay(date, today)) return "today";
  if (isSameDay(date, yesterday)) return "yesterday";
  return date.toLocaleDateString("en-US", { month: "short", day: "numeric" }).toLowerCase();
}

export function groupIdeasByDate(ideas: Idea[]): { label: string; ideas: Idea[] }[] {
  const sorted = [...ideas].sort(
    (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
  );

  const groups: { label: string; ideas: Idea[] }[] = [];
  for (const idea of sorted) {
    const label = dateLabel(idea.createdAt);
    const existing = groups.find((g) => g.label === label);
    if (existing) {
      existing.ideas.push(idea);
    } else {
      groups.push({ label, ideas: [idea] });
    }
  }
  return groups;
}