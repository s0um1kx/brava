if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("./sw.js").catch((err) => {
      console.error("Service worker registration failed:", err);
    });
  });
}

const captureBtn = document.getElementById("capture-btn");
const statusLine = document.getElementById("status-line");
const transcriptEl = document.getElementById("transcript");
const transcriptCleanEl = document.getElementById("transcript-clean");
const markdownArea = document.getElementById("markdown-area");
const markdownPreview = document.getElementById("markdown-preview");
const downloadBtn = document.getElementById("download-btn");
const saveBtn = document.getElementById("save-btn");
const saveStatus = document.getElementById("save-status");

// Point this at your backend. On your phone testing over the network,
// "localhost" won't reach your laptop — see README for the mixed-content
// note about HTTPS frontend + HTTP backend.
const BACKEND_URL = window.BRAVA_BACKEND_URL || "http://localhost:3000";

let currentMarkdown = null;

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isRecording = false;
let finalChunks = {};
let latestFullText = "";

function setStatus(text) {
  statusLine.textContent = text;
}

function finalizeCapture() {
  const raw = latestFullText.trim();
  const cleaned = window.BravaCleanup ? window.BravaCleanup.cleanTranscript(raw) : raw;
  transcriptCleanEl.textContent = cleaned;

  if (cleaned && window.BravaMarkdown) {
    currentMarkdown = window.BravaMarkdown.buildMarkdown(cleaned);
    markdownPreview.textContent = currentMarkdown.content;
    markdownArea.hidden = false;
  } else {
    markdownArea.hidden = true;
    currentMarkdown = null;
  }

  setStatus(raw ? "Captured — tap to speak again" : "Tap to speak");
}

function startRecording() {
  finalChunks = {};
  latestFullText = "";
  transcriptEl.textContent = "";
  transcriptCleanEl.textContent = "";
  markdownArea.hidden = true;
  currentMarkdown = null;
  saveStatus.textContent = "";

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const chunk = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        // Keyed by index, not appended — if the browser's recognition
        // session restarts and re-fires an index we've already seen,
        // this overwrites that slot instead of duplicating the text.
        finalChunks[i] = chunk;
      } else {
        interim += chunk;
      }
    }

    const finalTranscript = Object.keys(finalChunks)
      .map(Number)
      .sort((a, b) => a - b)
      .map((key) => finalChunks[key])
      .join(" ");

    transcriptEl.textContent = (finalTranscript + " " + interim).trim();
    latestFullText = finalTranscript + " " + interim;
  };

  recognition.onerror = (event) => {
    console.error("Speech recognition error:", event.error);
    if (event.error === "not-allowed" || event.error === "service-not-allowed") {
      setStatus("Microphone access denied — check browser permissions");
    } else if (event.error === "no-speech") {
      setStatus("Didn't catch that — tap to try again");
    } else {
      setStatus("Something went wrong — tap to try again");
    }
    stopRecordingUI();
  };

  recognition.onend = () => {
    if (isRecording) {
      stopRecordingUI();
      finalizeCapture();
    }
  };

  recognition.start();
  isRecording = true;
  captureBtn.classList.add("recording");
  setStatus("Listening…");
}

function stopRecording() {
  if (recognition) {
    recognition.stop();
  }
  stopRecordingUI();
  finalizeCapture();
}

function stopRecordingUI() {
  isRecording = false;
  captureBtn.classList.remove("recording");
}

captureBtn.addEventListener("click", () => {
  if (!SpeechRecognition) {
    setStatus("Speech recognition isn't supported in this browser");
    return;
  }

  if (isRecording) {
    stopRecording();
  } else {
    startRecording();
  }
});

if (!SpeechRecognition) {
  setStatus("Speech recognition isn't supported in this browser");
  captureBtn.disabled = true;
}

downloadBtn.addEventListener("click", () => {
  if (!currentMarkdown) return;

  const blob = new Blob([currentMarkdown.content], { type: "text/markdown" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = currentMarkdown.filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
});

saveBtn.addEventListener("click", async () => {
  if (!currentMarkdown) return;

  saveStatus.textContent = "Saving…";

  try {
    const response = await fetch(`${BACKEND_URL}/api/ideas`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(currentMarkdown),
    });

    const data = await response.json();

    if (!response.ok) {
      throw new Error(data.error || "Save failed.");
    }

    saveStatus.textContent = `Saved as ${data.filename}`;
  } catch (err) {
    console.error("Save error:", err);
    saveStatus.textContent = "Couldn't reach the server — is the backend running?";
  }
});
