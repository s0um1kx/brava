"use client";

import { useDeviceScreen } from "@/hooks/useDeviceScreen";
import { CaptureScreen } from "@/components/CaptureScreen";
import { ReviewScreen } from "@/components/ReviewScreen";

export default function Home() {
  const screen = useDeviceScreen();

  if (screen === null) return null; // avoids a flash of the wrong screen
  return screen === "capture" ? <CaptureScreen /> : <ReviewScreen />;
}