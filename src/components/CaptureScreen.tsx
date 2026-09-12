"use client";

import { useEffect, useState } from "react";
import { IconMicrophone, IconCheck, IconBrandGoogle } from "@tabler/icons-react";
import { useSpeechCapture } from "@/hooks/useSpeechCapture";
import { cleanTranscript } from "@/lib/cleanTranscript";
import { generateIdeaMarkdown } from "@/lib/generateIdeaMarkdown";

type CaptureState = "idle" | "listening" | "saved";

export function CaptureScreen() {
  const [state, setState] = useState<CaptureState>("idle");
  const [authChecked, setAuthChecked] = useState(false);
  const [signedIn, setSignedIn] = useState(false);
  const { start, stop } = useSpeechCapture();

  useEffect(() => {
    fetch("/api/auth/me")
      .then((res) => res.json())
      .then((data) => setSignedIn(!!data.user))
      .catch(() => setSignedIn(false))
      .finally(() => setAuthChecked(true));
  }, []);

  const handleTap = () => {
    if (state === "idle") {
      setState("listening");
      start();
    } else if (state === "listening") {
      const finalText = stop();
      const cleaned = cleanTranscript(finalText);
      const idea = generateIdeaMarkdown(cleaned);

      fetch("/api/ideas", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          title: idea.title,
          filename: idea.filename,
          markdown: idea.markdown,
        }),
      }).catch((err) => console.error("Failed to save idea:", err));

      setState("saved");
      setTimeout(() => setState("idle"), 1200);
    }
  };

  const label =
    state === "idle" ? "tap to capture" : state === "listening" ? "listening" : "saved";

  if (!authChecked) {
    return null;
  }

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        alignItems: "center",
        padding: "1.5rem",
      }}
    >
      <div style={{ width: "100%" }}>
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
          brava
        </span>
      </div>

      {!signedIn ? (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <a
            href="/api/auth/login"
            aria-label="Sign in with Google"
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              border: "0.5px solid var(--border-strong)",
              background: "var(--surface-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            <IconBrandGoogle size={32} color="var(--text-secondary)" stroke={1.75} />
          </a>
          <p style={{ fontSize: 13, color: "var(--text-muted)", margin: 0 }}>
            sign in to capture
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <button
            onClick={handleTap}
            aria-label={label}
            style={{
              width: 88,
              height: 88,
              borderRadius: "50%",
              border: state === "idle" ? "0.5px solid var(--border-strong)" : "none",
              background: state === "listening" ? "var(--bg-accent)" : "var(--surface-1)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              cursor: "pointer",
            }}
          >
            {state === "saved" ? (
              <IconCheck size={32} color="var(--text-success)" stroke={1.75} />
            ) : (
              <IconMicrophone
                size={32}
                color={state === "listening" ? "var(--text-accent)" : "var(--text-secondary)"}
                stroke={1.75}
              />
            )}
          </button>
          <p
            style={{
              fontSize: 13,
              margin: 0,
              color: state === "listening" ? "var(--text-accent)" : "var(--text-muted)",
            }}
          >
            {label}
          </p>
        </div>
      )}

      <div style={{ height: 4 }} />
    </div>
  );
}