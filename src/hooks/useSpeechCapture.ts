"use client";

import { useCallback, useRef, useState } from "react";

// Web Speech API types aren't in default TS lib — minimal shape we need
type SpeechRecognition = any;

export function useSpeechCapture() {
  const [transcript, setTranscript] = useState("");
  const [isListening, setIsListening] = useState(false);
  const recognitionRef = useRef<SpeechRecognition | null>(null);
  const finalTextRef = useRef(""); // accumulates confirmed (final) results only

  const start = useCallback(() => {
    const SpeechRecognitionCtor =
      (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;

    if (!SpeechRecognitionCtor) {
      alert("Speech recognition isn't supported in this browser.");
      return;
    }

    finalTextRef.current = "";
    setTranscript("");

    const recognition: SpeechRecognition = new SpeechRecognitionCtor();
    recognition.continuous = true;
    recognition.interimResults = true;
    recognition.lang = "en-US";

    recognition.onresult = (event: any) => {
      let interim = "";
      for (let i = event.resultIndex; i < event.results.length; i++) {
        const result = event.results[i];
        if (result.isFinal) {
          finalTextRef.current += result[0].transcript + " ";
        } else {
          interim += result[0].transcript;
        }
      }
      setTranscript(finalTextRef.current + interim);
    };

    recognition.onerror = (event: any) => {
      console.error("Speech recognition error:", event.error);
    };

    recognition.start();
    recognitionRef.current = recognition;
    setIsListening(true);
  }, []);

  const stop = useCallback(() => {
    recognitionRef.current?.stop();
    setIsListening(false);
    return finalTextRef.current.trim();
  }, []);

  return { start, stop, transcript, isListening };
}