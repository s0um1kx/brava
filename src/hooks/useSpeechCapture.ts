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
  const finalTextRef = useRef("");
  const optionsRef = useRef(options);
  optionsRef.current = options;

  const start = useCallback(() => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      optionsRef.current.onError?.("not-supported");
      return;
    }

    finalTextRef.current = "";

    const recognition: SpeechRecognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let hasNew = false;
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTextRef.current += result[0].transcript + " ";
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

    // Fires whether recognition stopped because the user tapped stop(),
    // or because the browser ended the session on its own (e.g. after a
    // pause). Either way, this is the single source of truth for "we're
    // done listening now" — the UI never gets silently stuck.
    recognition.onend = () => {
      setIsListening(false);
      optionsRef.current.onEnded?.(finalTextRef.current.trim());
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
