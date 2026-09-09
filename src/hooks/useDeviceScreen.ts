"use client";

import { useEffect, useState } from "react";

const BREAKPOINT = 640;

export function useDeviceScreen() {
  // null until mounted, so we never render the wrong screen during SSR/hydration
  const [screen, setScreen] = useState<"capture" | "review" | null>(null);

  useEffect(() => {
    const decide = () => {
      setScreen(window.innerWidth < BREAKPOINT ? "capture" : "review");
    };
    decide();
    window.addEventListener("resize", decide);
    return () => window.removeEventListener("resize", decide);
  }, []);

  return screen;
}