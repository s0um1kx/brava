"use client";

import { useState } from "react";
import { IconMicrophone, IconCheck } from "@tabler/icons-react";
import { useSpeechCapture } from "@/hooks/useSpeechCapture";

type CaptureState = "idle" | "listening" | "saved";

export function CaptureScreen() {
  const [state, setState] = useState<CaptureState>("idle");
  const { start, stop, transcript } = useSpeechCapture();

  const handleTap = () => {
    if (state === "idle") {
      setState("listening");
      start();
    } else if (state === "listening") {
      const finalText = stop();
      console.log("Captured transcript:", finalText); // temporary — step 5 replaces this
      setState("saved");
      setTimeout(() => setState("idle"), 1200);
    }
  };

  const label =
    state === "idle" ? "tap to capture" : state === "listening" ? "listening" : "saved";

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

      <div style={{ height: 4 }} />
    </div>
  );
}