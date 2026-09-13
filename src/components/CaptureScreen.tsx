"use client";

import { useRef, useState } from "react";
import { useSpeechCapture } from "@/hooks/useSpeechCapture";
import { cleanTranscript } from "@/lib/cleanTranscript";
import { generateIdeaMarkdown } from "@/lib/generateIdeaMarkdown";
import { useAuth } from "@/hooks/useAuth";

type CaptureState = "idle" | "listening" | "saving" | "saved" | "empty" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "microphone blocked — tap to retry",
  "audio-capture": "no microphone found — tap to retry",
  network: "connection issue — tap to retry",
  "not-supported": "speech recognition isn't supported here",
  "save-failed": "couldn't save — tap to retry",
};

const PULSE_THROTTLE_MS = 400;

const PILL_STYLES: Record<CaptureState, { bg: string; color: string; border: string }> = {
  idle: { bg: "var(--text-primary)", color: "var(--surface-2)", border: "none" },
  listening: { bg: "var(--bg-accent)", color: "var(--text-accent)", border: "none" },
  saving: { bg: "var(--surface-1)", color: "var(--text-muted)", border: "0.5px solid var(--border-strong)" },
  saved: { bg: "var(--surface-1)", color: "var(--text-success)", border: "0.5px solid var(--border)" },
  empty: { bg: "var(--surface-1)", color: "var(--text-muted)", border: "0.5px solid var(--border-strong)" },
  error: { bg: "var(--surface-1)", color: "var(--text-warning)", border: "0.5px solid var(--border-strong)" },
};

export function CaptureScreen() {
  const [state, setState] = useState<CaptureState>("idle");
  const [errorMessage, setErrorMessage] = useState("");
  const [pulseCount, setPulseCount] = useState(0);
  const lastPulseRef = useRef(0);
  const { user, loading } = useAuth();

  const { start, stop } = useSpeechCapture({
    onSoundDetected: () => {
      const now = Date.now();
      if (now - lastPulseRef.current > PULSE_THROTTLE_MS) {
        lastPulseRef.current = now;
        setPulseCount((c) => c + 1);
      }
    },
    onEnded: async (finalText) => {
      const cleaned = cleanTranscript(finalText);

      if (!cleaned) {
        setState("empty");
        return;
      }

      setState("saving");
      const idea = generateIdeaMarkdown(cleaned);

      try {
        const res = await fetch("/api/ideas", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            title: idea.title,
            filename: idea.filename,
            markdown: idea.markdown,
          }),
        });

        if (!res.ok) throw new Error(`Save failed with status ${res.status}`);

        setState("saved");
        setTimeout(() => setState("idle"), 1200);
      } catch (err) {
        console.error("Failed to save idea:", err);
        setErrorMessage(ERROR_MESSAGES["save-failed"]);
        setState("error");
      }
    },
    onError: (error) => {
      setErrorMessage(ERROR_MESSAGES[error] ?? "something went wrong — tap to retry");
      setState("error");
    },
  });

  const handleTap = () => {
    if (state === "idle" || state === "error" || state === "empty") {
      setState("listening");
      start();
    } else if (state === "listening") {
      stop(); // onEnded above takes it from here
    }
  };

  const label =
    state === "idle"
      ? "start capture"
      : state === "listening"
        ? "tap to finish"
        : state === "saving"
          ? "saving…"
          : state === "saved"
            ? "saved"
            : state === "empty"
              ? "didn't catch that — tap to retry"
              : errorMessage;

  if (loading) {
    return null;
  }

  const pillStyle = PILL_STYLES[state];

  return (
    <div
      style={{
        height: "100dvh",
        display: "flex",
        flexDirection: "column",
        justifyContent: "space-between",
        padding: "1.5rem",
      }}
    >
      <div
        style={{
          width: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
        }}
      >
        <span style={{ fontSize: 13, fontWeight: 500, color: "var(--text-secondary)" }}>
          brava
        </span>
        {user && (
          <a href="/api/auth/logout" style={{ fontSize: 13, color: "var(--text-muted)" }}>
            sign out
          </a>
        )}
      </div>

      {!user ? (
        <div>
          <p
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "var(--text-primary)",
              margin: "0 0 8px",
              lineHeight: 1.3,
            }}
          >
            Say it before it&apos;s gone.
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: "0 0 24px", lineHeight: 1.5 }}>
            Sign in to start capturing your ideas.
          </p>
        </div>
      ) : (
        <div>
          <p
            style={{
              fontSize: 20,
              fontWeight: 500,
              color: "var(--text-primary)",
              margin: "0 0 8px",
              lineHeight: 1.3,
            }}
          >
            Say it before it&apos;s gone.
          </p>
          <p style={{ fontSize: 13, color: "var(--text-secondary)", margin: 0, lineHeight: 1.5 }}>
            We&apos;ll clean it up and have it waiting for you.
          </p>
        </div>
      )}

      <div style={{ position: "relative" }}>
        {state === "listening" && (
          <div
            key={pulseCount}
            style={{
              position: "absolute",
              inset: -4,
              borderRadius: 30,
              border: "2px solid var(--text-accent)",
              animation: "brava-pulse 0.6s ease-out",
              pointerEvents: "none",
            }}
          />
        )}
        <a
          href={!user ? "/api/auth/login" : undefined}
          onClick={user ? handleTap : undefined}
          role="button"
          aria-disabled={state === "saving" || state === "saved"}
          style={{
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            width: "100%",
            height: 52,
            borderRadius: 26,
            background: !user ? "var(--text-primary)" : pillStyle.bg,
            color: !user ? "var(--surface-2)" : pillStyle.color,
            border: !user ? "none" : pillStyle.border,
            fontSize: 14,
            fontWeight: 500,
            textDecoration: "none",
            cursor: state === "saving" || state === "saved" ? "default" : "pointer",
            pointerEvents: state === "saving" || state === "saved" ? "none" : "auto",
          }}
        >
          {!user ? "sign in with google" : label}
        </a>
      </div>
    </div>
  );
}
