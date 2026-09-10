function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/[^a-z0-9\s-]/g, "")
    .trim()
    .replace(/\s+/g, "-")
    .slice(0, 60);
}

function titleFromTranscript(text: string): string {
  const words = text.split(/\s+/).filter(Boolean).slice(0, 8);
  const title = words.join(" ");
  return title.charAt(0).toUpperCase() + title.slice(1);
}

export interface GeneratedIdea {
  title: string;
  filename: string;
  markdown: string;
  createdAt: Date;
}

export function generateIdeaMarkdown(cleanedTranscript: string): GeneratedIdea {
  const title = titleFromTranscript(cleanedTranscript);
  const createdAt = new Date();
  const dateStr = createdAt.toISOString().split("T")[0]; // YYYY-MM-DD
  const slug = slugify(title);
  const filename = `${dateStr}-${slug}.md`;

  const markdown = `---
title: ${title}
created: ${createdAt.toISOString()}
reviewed: false
---

# ${title}

${cleanedTranscript}

- [ ] Reviewed
`;

  return { title, filename, markdown, createdAt };
}