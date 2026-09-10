"use client";

import { IconSearch, IconPointFilled, IconCheck } from "@tabler/icons-react";
import { MOCK_IDEAS, Idea } from "@/lib/mockIdeas";
import { groupIdeasByDate } from "@/lib/groupIdeasByDate";

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function IdeaRow({ idea }: { idea: Idea }) {
  return (
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: 12,
        padding: "12px 4px",
        borderBottom: "0.5px solid var(--border)",
        cursor: "pointer",
      }}
    >
      {idea.reviewed ? (
        <IconCheck size={14} color="var(--text-muted)" stroke={2} />
      ) : (
        <IconPointFilled size={14} color="var(--text-warning)" />
      )}
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontSize: 14,
            fontWeight: 500,
            margin: 0,
            color: idea.reviewed ? "var(--text-secondary)" : "var(--text-primary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {idea.title}
        </p>
        <p
          style={{
            fontSize: 13,
            margin: "2px 0 0",
            color: idea.reviewed ? "var(--text-muted)" : "var(--text-secondary)",
            whiteSpace: "nowrap",
            overflow: "hidden",
            textOverflow: "ellipsis",
          }}
        >
          {idea.preview}
        </p>
      </div>
      <span style={{ fontSize: 12, color: "var(--text-muted)", flexShrink: 0 }}>
        {formatTime(idea.createdAt)}
      </span>
    </div>
  );
}

export function ReviewScreen() {
  const groups = groupIdeasByDate(MOCK_IDEAS);

  return (
    <div style={{ maxWidth: 560, margin: "0 auto", padding: "1.5rem 1rem" }}>
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: 8,
          height: 36,
          padding: "0 12px",
          border: "0.5px solid var(--border)",
          borderRadius: 8,
          background: "var(--surface-1)",
          marginBottom: 20,
        }}
      >
        <IconSearch size={16} color="var(--text-muted)" stroke={1.75} />
        <span style={{ fontSize: 14, color: "var(--text-muted)" }}>search ideas</span>
      </div>

      {groups.map((group) => (
        <div key={group.label}>
          <p
            style={{
              fontSize: 13,
              fontWeight: 500,
              color: "var(--text-muted)",
              margin: "20px 0 4px",
              padding: "0 4px",
            }}
          >
            {group.label}
          </p>
          {group.ideas.map((idea) => (
            <IdeaRow key={idea.id} idea={idea} />
          ))}
        </div>
      ))}
    </div>
  );
}