"use client";

import { useRef, useState } from "react";
import {
  IconMicrophone,
  IconCheck,
  IconBrandGoogle,
  IconMicrophoneOff,
  IconAlertCircle,
} from "@tabler/icons-react";
import { useSpeechCapture } from "@/hooks/useSpeechCapture";
import { cleanTranscript } from "@/lib/cleanTranscript";
import { generateIdeaMarkdown } from "@/lib/generateIdeaMarkdown";
import { useAuth } from "@/hooks/useAuth";

type CaptureState = "idle" | "listening" | "saving" | "saved" | "empty" | "error";

const ERROR_MESSAGES: Record<string, string> = {
  "not-allowed": "microphone blocked — check permissions",
  "audio-capture": "no microphone found",
  network: "connection issue — try again",
  "not-supported": "speech recognition isn't supported here",
  "save-failed": "couldn't save — try again",
};

const PULSE_THROTTLE_MS = 400;

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
        setTimeout(() => setState("idle"), 1500);
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
      setErrorMessage(ERROR_MESSAGES[error] ?? "something went wrong");
      setState("error");
    },
  });

  const handleTap = () => {
    if (state === "idle" || state === "error") {
      setState("listening");
      start();
    } else if (state === "listening") {
      stop(); // onEnded above takes it from here
    }
  };

  const label =
    state === "idle"
      ? "tap to capture"
      : state === "listening"
        ? "listening"
        : state === "saving"
          ? "saving…"
          : state === "saved"
            ? "saved"
            : state === "empty"
              ? "didn't catch anything"
              : errorMessage;

  if (loading) {
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
            sign in with google
          </p>
        </div>
      ) : (
        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", gap: 16 }}>
          <div style={{ position: "relative", width: 88, height: 88 }}>
            {state === "listening" && (
              <div
                key={pulseCount}
                style={{
                  position: "absolute",
                  inset: -6,
                  borderRadius: "50%",
                  border: "2px solid var(--text-accent)",
                  animation: "brava-pulse 0.6s ease-out",
                  pointerEvents: "none",
                }}
              />
            )}
            <button
              onClick={handleTap}
              aria-label={label}
              disabled={state === "saving"}
              style={{
                width: 88,
                height: 88,
                borderRadius: "50%",
                border:
                  state === "idle" || state === "error"
                    ? "0.5px solid var(--border-strong)"
                    : "none",
                background: state === "listening" ? "var(--bg-accent)" : "var(--surface-1)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                cursor: state === "saving" ? "default" : "pointer",
              }}
            >
              {state === "saved" ? (
                <IconCheck size={32} color="var(--text-success)" stroke={1.75} />
              ) : state === "empty" ? (
                <IconMicrophoneOff size={32} color="var(--text-muted)" stroke={1.75} />
              ) : state === "error" ? (
                <IconAlertCircle size={32} color="var(--text-warning)" stroke={1.75} />
              ) : (
                <IconMicrophone
                  size={32}
                  color={state === "listening" ? "var(--text-accent)" : "var(--text-secondary)"}
                  stroke={1.75}
                />
              )}
            </button>
          </div>
          <p
            style={{
              fontSize: 13,
              margin: 0,
              textAlign: "center",
              color:
                state === "listening"
                  ? "var(--text-accent)"
                  : state === "error"
                    ? "var(--text-warning)"
                    : "var(--text-muted)",
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
