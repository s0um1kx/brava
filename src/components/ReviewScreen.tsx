"use client";

import { useEffect, useState } from "react";
import {
  IconSearch,
  IconCheck,
  IconBrandGoogle,
  IconCopy,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Idea } from "@/lib/types";
import { groupIdeasByDate } from "@/lib/groupIdeasByDate";
import { useAuth } from "@/hooks/useAuth";
import { BrandMark } from "@/components/BrandMark";

interface IdeaDetail {
  body: string;
  reviewed: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function StatusDot({ reviewed }: { reviewed: boolean }) {
  if (reviewed) {
    return (
      <span
        style={{
          height: 14,
          width: 14,
          borderRadius: "50%",
          border: "0.5px solid rgba(37,69,216,0.15)",
          background: "var(--surface-hover)",
          display: "grid",
          placeItems: "center",
          flexShrink: 0,
        }}
      >
        <IconCheck size={9} color="var(--bg-accent)" stroke={2.5} />
      </span>
    );
  }
  return (
    <span
      style={{
        height: 8,
        width: 8,
        borderRadius: "50%",
        background: "var(--bg-accent)",
        flexShrink: 0,
        animation: "pulse-white 2s ease-in-out infinite",
      }}
    />
  );
}

function IdeaRow({
  idea,
  expanded,
  onToggle,
}: {
  idea: Idea;
  expanded: boolean;
  onToggle: () => void;
}) {
  return (
    <div
      onClick={onToggle}
      className="brava-lift"
      style={{
        display: "flex",
        alignItems: "center",
        gap: 10,
        padding: "12px 10px",
        borderRadius: 10,
        borderBottom: expanded ? "none" : "1px solid var(--border)",
        cursor: "pointer",
      }}
    >
      <StatusDot reviewed={idea.reviewed} />
      <div style={{ flex: 1, minWidth: 0 }}>
        <p
          style={{
            fontFamily: "Inter, sans-serif",
            fontSize: 13.5,
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
            fontSize: 12,
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
      <span
        style={{
          fontFamily: "'Geist Mono', ui-monospace, monospace",
          fontSize: 10,
          fontVariantNumeric: "tabular-nums",
          color: "var(--text-muted)",
          flexShrink: 0,
        }}
      >
        {formatTime(idea.createdAt)}
      </span>
    </div>
  );
}

function IdeaDetailPanel({
  idea,
  detail,
  onToggleReviewed,
  onDelete,
}: {
  idea: Idea;
  detail: IdeaDetail | null;
  onToggleReviewed: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!detail) return;
    await navigator.clipboard.writeText(detail.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = () => {
    if (window.confirm("Delete this idea permanently?")) {
      onDelete();
    }
  };

  return (
    <div
      style={{
        padding: "4px 10px 16px",
        borderBottom: "1px solid var(--border)",
      }}
    >
      {!detail ? (
        <p style={{ fontSize: 13, color: "var(--text-muted)" }}>loading…</p>
      ) : (
        <>
          <p
            style={{
              fontSize: 13.5,
              lineHeight: 1.6,
              color: "var(--text-primary)",
              whiteSpace: "pre-wrap",
              margin: "8px 0 14px",
            }}
          >
            {detail.body}
          </p>
          <div
            style={{
              display: "flex",
              gap: 16,
              alignItems: "center",
              paddingTop: 12,
              borderTop: "1px solid var(--border)",
            }}
          >
            <button
              onClick={handleCopy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12.5,
                color: "var(--text-secondary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              <IconCopy size={14} stroke={1.75} />
              {copied ? "copied" : "copy"}
            </button>
            <button
              onClick={onToggleReviewed}
              style={{
                fontSize: 12.5,
                color: "var(--text-secondary)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
              }}
            >
              {detail.reviewed ? "mark unreviewed" : "mark reviewed"}
            </button>
            <button
              onClick={handleDelete}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                fontSize: 12.5,
                color: "var(--text-danger)",
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginLeft: "auto",
              }}
            >
              <IconTrash size={14} stroke={1.75} />
              delete
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export function ReviewScreen() {
  const [ideas, setIdeas] = useState<Idea[]>([]);
  const [loadingIdeas, setLoadingIdeas] = useState(true);
  const [expandedId, setExpandedId] = useState<number | null>(null);
  const [detailsById, setDetailsById] = useState<Record<number, IdeaDetail>>({});
  const [searchQuery, setSearchQuery] = useState("");
  const { user, loading: loadingAuth } = useAuth();

  useEffect(() => {
    fetch("/api/ideas")
      .then((res) => (res.ok ? res.json() : []))
      .then((data) => setIdeas(data))
      .catch((err) => console.error("Failed to load ideas:", err))
      .finally(() => setLoadingIdeas(false));
  }, []);

  const handleToggleExpand = async (idea: Idea) => {
    if (expandedId === idea.id) {
      setExpandedId(null);
      return;
    }
    setExpandedId(idea.id);
    if (!detailsById[idea.id]) {
      try {
        const res = await fetch(`/api/ideas/${idea.id}`);
        if (!res.ok) throw new Error(`Failed with status ${res.status}`);
        const data = await res.json();
        setDetailsById((prev) => ({
          ...prev,
          [idea.id]: { body: data.body, reviewed: data.reviewed },
        }));
      } catch (err) {
        console.error("Failed to load idea detail:", err);
      }
    }
  };

  const handleToggleReviewed = async (idea: Idea) => {
    const current = detailsById[idea.id];
    if (!current) return;
    const nextReviewed = !current.reviewed;
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed: nextReviewed }),
      });
      if (!res.ok) throw new Error(`Failed with status ${res.status}`);
      setDetailsById((prev) => ({ ...prev, [idea.id]: { ...prev[idea.id], reviewed: nextReviewed } }));
      setIdeas((prev) => prev.map((i) => (i.id === idea.id ? { ...i, reviewed: nextReviewed } : i)));
    } catch (err) {
      console.error("Failed to update reviewed status:", err);
    }
  };

  const handleDelete = async (idea: Idea) => {
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, { method: "DELETE" });
      if (!res.ok) throw new Error(`Failed with status ${res.status}`);
      setIdeas((prev) => prev.filter((i) => i.id !== idea.id));
      setDetailsById((prev) => {
        const next = { ...prev };
        delete next[idea.id];
        return next;
      });
      setExpandedId(null);
    } catch (err) {
      console.error("Failed to delete idea:", err);
    }
  };

  const filteredIdeas = searchQuery.trim()
    ? ideas.filter(
        (idea) =>
          idea.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
          idea.preview.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : ideas;

  const groups = groupIdeasByDate(filteredIdeas);

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: "var(--surface-2)", color: "var(--text-primary)" }}>
      <div
        style={{
          position: "sticky",
          top: 0,
          zIndex: 10,
          background: "rgba(250, 246, 239, 0.9)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          borderBottom: "1px solid var(--border)",
        }}
      >
        <div style={{ maxWidth: 560, margin: "0 auto", padding: "16px 16px 12px" }}>
          <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 16 }}>
            <div style={{ display: "flex", alignItems: "center", gap: 8 }}>
              <BrandMark size={20} color="var(--text-primary)" />
              <span style={{ fontSize: 16, fontWeight: 600, letterSpacing: 1, color: "var(--text-primary)" }}>
                brava
              </span>
            </div>
            {loadingAuth ? null : user ? (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--text-muted)" }}>
                {user.email}{" "}
                <a href="/api/auth/logout" style={{ color: "var(--text-secondary)" }}>
                  sign out
                </a>
              </span>
            ) : (
              <a
                href="/api/auth/login"
                style={{ display: "flex", alignItems: "center", gap: 6, fontSize: 13, color: "var(--bg-accent)" }}
              >
                <IconBrandGoogle size={14} stroke={1.75} />
                sign in
              </a>
            )}
          </div>

          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 38,
              padding: "0 12px",
              border: "1px solid var(--border)",
              borderRadius: 10,
              background: "var(--surface-1)",
            }}
          >
            <IconSearch size={16} color="var(--text-muted)" stroke={1.75} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="search ideas"
              style={{
                border: "none",
                outline: "none",
                background: "transparent",
                fontSize: 14,
                color: "var(--text-primary)",
                width: "100%",
              }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                className="brava-lift"
                style={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  width: 22,
                  height: 22,
                  borderRadius: "50%",
                  border: "none",
                  background: "transparent",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  flexShrink: 0,
                }}
              >
                <IconX size={14} stroke={1.75} />
              </button>
            )}
          </div>
        </div>
      </div>

      <div style={{ maxWidth: 560, margin: "0 auto", padding: "16px 16px 40px" }}>
        {!loadingIdeas && ideas.length === 0 && (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, letterSpacing: "-0.01em", color: "var(--text-primary)", margin: 0 }}>
              No ideas captured yet.
            </p>
          </div>
        )}

        {!loadingIdeas && ideas.length > 0 && filteredIdeas.length === 0 && (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, letterSpacing: "-0.01em", color: "var(--text-primary)", margin: "0 0 6px" }}>
              no ideas match
            </p>
            <p style={{ fontFamily: "'Geist Mono', ui-monospace, monospace", fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
              try a different search
            </p>
          </div>
        )}

        {groups.map((group) => (
          <div key={group.label}>
            <p
              style={{
                fontFamily: "'Geist Mono', ui-monospace, monospace",
                fontSize: 10,
                fontWeight: 500,
                color: "var(--text-muted)",
                margin: "20px 0 4px",
                padding: "0 10px",
                textTransform: "uppercase",
                letterSpacing: "0.06em",
              }}
            >
              {group.label}
            </p>
            {group.ideas.map((idea) => (
              <div key={idea.id}>
                <IdeaRow idea={idea} expanded={expandedId === idea.id} onToggle={() => handleToggleExpand(idea)} />
                {expandedId === idea.id && (
                  <IdeaDetailPanel
                    idea={idea}
                    detail={detailsById[idea.id] ?? null}
                    onToggleReviewed={() => handleToggleReviewed(idea)}
                    onDelete={() => handleDelete(idea)}
                  />
                )}
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}
