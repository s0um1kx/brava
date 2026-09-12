"use client";

import { useCallback, useRef, useState } from "react";

type SpeechRecognition = any;

interface UseSpeechCaptureOptions {
  onSoundDetected?: () => void;
  onEnded?: (finalText: string) => void;
  onError?: (error: string) => void;
}

export function useSpeechCapture(options: UseSpeechCaptureOptions = {}) {
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  // Indexed by the browser's own result index, so a re-fired event for a
  // result we've already finalized overwrites that slot instead of being
  // appended again — this is what actually prevents the duplication.
  const finalizedResultsRef = useRef<string[]>([]);
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const start = useCallback(() => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      optionsRef.current.onError?.("not-supported");
      return;
    }

    finalizedResultsRef.current = [];

    const recognition: SpeechRecognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let hasNew = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalizedResultsRef.current[i] = result[0].transcript.trim();
        }
        hasNew = true;
      }
      if (hasNew) optionsRef.current.onSoundDetected?.();
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
      if (
        event.error === "not-allowed" ||
        event.error === "audio-capture" ||
        event.error === "network"
      ) {
        optionsRef.current.onError?.(event.error);
      }
    };

    recognition.onend = () => {
      setIsListening(false);
      // Join only the slots that actually got a final result — filters out
      // any gaps left by interim-only indices.
      const finalText = finalizedResultsRef.current.filter(Boolean).join(" ");
      optionsRef.current.onEnded?.(finalText);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
  }, []);

  return { start, stop, isListening };
}
