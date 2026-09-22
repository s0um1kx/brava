"use client";

import { useEffect, useState } from "react";
import {
  IconSearch,
  IconHome,
  IconSettings,
  IconCopy,
  IconTrash,
  IconX,
} from "@tabler/icons-react";
import { Idea } from "@/lib/types";
import { useAuth } from "@/hooks/useAuth";

interface IdeaDetail {
  body: string;
  reviewed: boolean;
}

function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString("en-US", { hour: "numeric", minute: "2-digit" });
}

function IdeaCard({
  idea,
  expanded,
  detail,
  onToggle,
  onToggleReviewed,
  onDelete,
}: {
  idea: Idea;
  expanded: boolean;
  detail: IdeaDetail | null;
  onToggle: () => void;
  onToggleReviewed: () => void;
  onDelete: () => void;
}) {
  const [copied, setCopied] = useState(false);
  const unreviewed = !idea.reviewed;

  const handleCopy = async (e: React.MouseEvent) => {
    e.stopPropagation();
    if (!detail) return;
    await navigator.clipboard.writeText(detail.body);
    setCopied(true);
    setTimeout(() => setCopied(false), 1500);
  };

  const handleDelete = (e: React.MouseEvent) => {
    e.stopPropagation();
    if (window.confirm("Delete this idea permanently?")) onDelete();
  };

  const handleToggleReviewed = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleReviewed();
  };

  return (
    <div
      onClick={onToggle}
      className="brava-lift"
      style={{
        breakInside: "avoid",
        marginBottom: 2,
        padding: "16px 18px",
        cursor: "pointer",
        background: unreviewed ? "var(--bg-accent)" : "var(--surface-1)",
        color: unreviewed ? "#FFFFFF" : "var(--text-primary)",
      }}
    >
      <div style={{ display: "flex", alignItems: "center", justifyContent: "space-between", marginBottom: 10 }}>
        <div style={{ display: "flex", alignItems: "center", gap: 6 }}>
          <span
            style={{
              width: 16,
              height: 16,
              borderRadius: 3,
              display: "grid",
              placeItems: "center",
              background: unreviewed ? "rgba(255,255,255,0.18)" : "var(--surface-hover)",
            }}
          >
            <span
              style={{
                width: 5,
                height: 5,
                borderRadius: "50%",
                background: unreviewed ? "#FFFFFF" : "var(--bg-accent)",
              }}
            />
          </span>
          <span
            style={{
              width: 5,
              height: 5,
              borderRadius: "50%",
              background: unreviewed ? "rgba(255,255,255,0.4)" : "var(--border-strong)",
            }}
          />
        </div>
        <span
          style={{
            fontFamily: "'Geist Mono', ui-monospace, monospace",
            fontSize: 10,
            fontVariantNumeric: "tabular-nums",
            color: unreviewed ? "rgba(255,255,255,0.7)" : "var(--text-muted)",
          }}
        >
          {formatTime(idea.createdAt)}
        </span>
      </div>

      <p style={{ fontSize: 15, fontWeight: 700, margin: "0 0 6px", lineHeight: 1.3 }}>{idea.title}</p>

      {!expanded ? (
        <p
          style={{
            fontSize: 13,
            margin: 0,
            lineHeight: 1.5,
            color: unreviewed ? "rgba(255,255,255,0.7)" : "var(--text-secondary)",
            display: "-webkit-box",
            WebkitLineClamp: 2,
            WebkitBoxOrient: "vertical",
            overflow: "hidden",
          }}
        >
          {idea.preview}
        </p>
      ) : (
        <>
          <p
            style={{
              fontSize: 13,
              margin: "0 0 14px",
              lineHeight: 1.6,
              whiteSpace: "pre-wrap",
              color: unreviewed ? "rgba(255,255,255,0.9)" : "var(--text-secondary)",
            }}
          >
            {detail ? detail.body : "loading…"}
          </p>
          <div
            style={{
              display: "flex",
              gap: 14,
              alignItems: "center",
              paddingTop: 10,
              borderTop: unreviewed ? "1px solid rgba(255,255,255,0.18)" : "1px solid var(--border)",
            }}
          >
            <button
              onClick={handleCopy}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: unreviewed ? "rgba(255,255,255,0.85)" : "var(--text-secondary)",
              }}
            >
              <IconCopy size={13} stroke={1.75} />
              {copied ? "copied" : "copy"}
            </button>
            <button
              onClick={handleToggleReviewed}
              style={{
                fontSize: 12,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                color: unreviewed ? "rgba(255,255,255,0.85)" : "var(--text-secondary)",
              }}
            >
              {idea.reviewed ? "mark unreviewed" : "mark reviewed"}
            </button>
            <button
              onClick={handleDelete}
              style={{
                display: "flex",
                alignItems: "center",
                gap: 5,
                fontSize: 12,
                background: "none",
                border: "none",
                cursor: "pointer",
                padding: 0,
                marginLeft: "auto",
                color: unreviewed ? "#FFD9D2" : "var(--text-danger)",
              }}
            >
              <IconTrash size={13} stroke={1.75} />
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
        setDetailsById((prev) => ({ ...prev, [idea.id]: { body: data.body, reviewed: data.reviewed } }));
      } catch (err) {
        console.error("Failed to load idea detail:", err);
      }
    }
  };

  const handleToggleReviewed = async (idea: Idea) => {
    const nextReviewed = !idea.reviewed;
    try {
      const res = await fetch(`/api/ideas/${idea.id}`, {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reviewed: nextReviewed }),
      });
      if (!res.ok) throw new Error(`Failed with status ${res.status}`);
      setIdeas((prev) => prev.map((i) => (i.id === idea.id ? { ...i, reviewed: nextReviewed } : i)));
      setDetailsById((prev) =>
        prev[idea.id] ? { ...prev, [idea.id]: { ...prev[idea.id], reviewed: nextReviewed } } : prev
      );
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

  const unreviewedCount = ideas.filter((i) => !i.reviewed).length;

  const gridBackground =
    "repeating-linear-gradient(0deg, rgba(37,69,216,0.08) 0px, rgba(37,69,216,0.08) 1px, transparent 1px, transparent 44px)," +
    "repeating-linear-gradient(90deg, rgba(37,69,216,0.08) 0px, rgba(37,69,216,0.08) 1px, transparent 1px, transparent 44px)," +
    "var(--surface-2)";

  return (
    <div style={{ minHeight: "100vh", width: "100%", background: gridBackground, color: "var(--text-primary)" }}>
      {/* header */}
      <div
        style={{
          borderTop: "3px solid var(--bg-accent)",
          borderBottom: "1px solid var(--border)",
          background: "rgba(250, 246, 239, 0.92)",
          backdropFilter: "blur(10px)",
          WebkitBackdropFilter: "blur(10px)",
          position: "sticky",
          top: 0,
          zIndex: 10,
        }}
      >
        <div
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            padding: "12px 20px",
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 10 }}>
            <span
              style={{
                width: 26,
                height: 26,
                borderRadius: 6,
                background: "var(--bg-accent)",
                display: "grid",
                placeItems: "center",
              }}
            >
              <IconHome size={15} color="#FFFFFF" stroke={2} />
            </span>
            <span style={{ fontFamily: "'Fraunces', serif", fontWeight: 600, fontSize: 19, color: "var(--text-primary)" }}>
              brava
            </span>
            <IconSettings size={14} color="var(--text-muted)" stroke={1.75} />
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <span
              style={{
                display: "flex",
                alignItems: "center",
                gap: 6,
                background: "var(--bg-accent)",
                color: "#FFFFFF",
                fontFamily: "'Geist Mono', ui-monospace, monospace",
                fontSize: 11,
                letterSpacing: "0.06em",
                padding: "5px 12px",
                borderRadius: 999,
              }}
            >
              <span style={{ width: 5, height: 5, borderRadius: "50%", background: "#FFFFFF" }} />
              {String(unreviewedCount).padStart(2, "0")} / REVIEW
            </span>
            {!loadingAuth && user && (
              <span style={{ display: "flex", alignItems: "center", gap: 6, fontFamily: "'Geist Mono', ui-monospace, monospace", fontSize: 12, color: "var(--text-secondary)" }}>
                {user.email}
                <a href="/api/auth/logout" style={{ color: "var(--bg-accent)", textDecoration: "underline" }}>
                  sign out
                </a>
              </span>
            )}
          </div>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: 16, padding: "0 20px 16px" }}>
          <div
            style={{
              flex: 1,
              maxWidth: 420,
              display: "flex",
              alignItems: "center",
              gap: 8,
              height: 40,
              padding: "0 14px",
              border: "1px solid var(--border)",
              borderRadius: 10,
              background: "var(--surface-1)",
            }}
          >
            <IconSearch size={16} color="var(--text-muted)" stroke={1.75} />
            <input
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Search ideas..."
              style={{ border: "none", outline: "none", background: "transparent", fontSize: 14, color: "var(--text-primary)", width: "100%" }}
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                aria-label="Clear search"
                style={{ display: "flex", border: "none", background: "none", cursor: "pointer", color: "var(--text-secondary)", padding: 0 }}
              >
                <IconX size={14} stroke={1.75} />
              </button>
            )}
          </div>
          <span style={{ fontFamily: "'Geist Mono', ui-monospace, monospace", fontSize: 11, letterSpacing: "0.06em", color: "var(--text-secondary)", textTransform: "uppercase", whiteSpace: "nowrap" }}>
            {ideas.length} total · {unreviewedCount} to review
          </span>
        </div>
      </div>

      {/* content */}
      <div style={{ padding: 20 }}>
        {!loadingIdeas && ideas.length === 0 && (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "var(--text-primary)", margin: 0 }}>
              No ideas captured yet.
            </p>
          </div>
        )}

        {!loadingIdeas && ideas.length > 0 && filteredIdeas.length === 0 && (
          <div style={{ padding: "80px 0", textAlign: "center" }}>
            <p style={{ fontFamily: "'Instrument Serif', serif", fontSize: 18, color: "var(--text-primary)", margin: "0 0 6px" }}>
              no ideas match
            </p>
            <p style={{ fontFamily: "'Geist Mono', ui-monospace, monospace", fontSize: 11, color: "var(--text-muted)", margin: 0 }}>
              try a different search
            </p>
          </div>
        )}

        {filteredIdeas.length > 0 && (
          <div
            style={{
              columnCount: 4,
              columnGap: 2,
            }}
            className="brava-card-columns"
          >
            {filteredIdeas.map((idea) => (
              <IdeaCard
                key={idea.id}
                idea={idea}
                expanded={expandedId === idea.id}
                detail={detailsById[idea.id] ?? null}
                onToggle={() => handleToggleExpand(idea)}
                onToggleReviewed={() => handleToggleReviewed(idea)}
                onDelete={() => handleDelete(idea)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
