"use client";

import { useCallback, useRef, useState } from "react";

type SpeechRecognitionType = any;

interface UseSpeechCaptureOptions {
  onSoundDetected?: () => void;
  onEnded?: (finalText: string) => void;
  onError?: (error: string) => void;
}

export function useSpeechCapture(options: UseSpeechCaptureOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognitionType | null>(null);
  // Each recognition instance only ever contributes its own finalized
  // segments once, then we chain a new instance — so this is a simple
  // append, not an index-keyed structure. That's intentional: the bug this
  // fixes is Chrome silently re-transcribing old audio as brand-new result
  // indices inside ONE long-running session, so the real fix is to never
  // let a single session run long enough for that to happen.
  const segmentsRef = useRef<string[]>([]);
  const stopRequestedRef = useRef(false);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const createRecognition = useCallback((): SpeechRecognitionType | null => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognitionCtor) return null;

    const recognition: SpeechRecognitionType = new SpeechRecognitionCtor();
    recognition.continuous = false; // one utterance per instance, on purpose
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let hasNew = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          segmentsRef.current.push(result[0].transcript.trim());
        }
        hasNew = true;
      }
      if (hasNew) optionsRef.current.onSoundDetected?.();
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (event.error === "no-speech") {
        // Just a quiet gap between words — not a real error, let onend
        // below chain the next instance as normal.
        return;
      }
      if (
        event.error === "not-allowed" ||
        event.error === "audio-capture" ||
        event.error === "network"
      ) {
        stopRequestedRef.current = true;
        optionsRef.current.onError?.(event.error);
      }
    };

    recognition.onend = () => {
      if (stopRequestedRef.current) {
        setIsListening(false);
        const finalText = segmentsRef.current.join(" ").trim();
        optionsRef.current.onEnded?.(finalText);
        return;
      }
      // The user hasn't tapped stop — chain a fresh instance to keep
      // listening seamlessly for the next bit of speech.
      const next = createRecognition();
      if (next) {
        recognitionRef.current = next;
        next.start();
      }
    };

    return recognition;
  }, []);

  const start = useCallback(() => {
    const recognition = createRecognition();
    if (!recognition) {
      optionsRef.current.onError?.("not-supported");
      return;
    }
    segmentsRef.current = [];
    stopRequestedRef.current = false;
    recognitionRef.current = recognition;
    recognition.start();
    setIsListening(true);
  }, [createRecognition]);

  const stop = useCallback(() => {
    stopRequestedRef.current = true;
    recognitionRef.current?.stop();
  }, []);

  return { start, stop, isListening };
}
