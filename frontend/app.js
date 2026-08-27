if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  });
}

const captureBtn = document.getElementById("capture-btn");
const statusLine = document.getElementById("status-line");

// Milestone 1: skeleton only. Real recording + transcription land in Milestone 2.
captureBtn.addEventListener("click", () => {
  captureBtn.classList.toggle("recording");
  const isRecording = captureBtn.classList.contains("recording");
  statusLine.textContent = isRecording
    ? "Listening… (capture not wired up yet)"
    : "Tap to speak";
});
