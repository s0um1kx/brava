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

const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;

let recognition = null;
let isRecording = false;
let finalTranscript = "";

function setStatus(text) {
  statusLine.textContent = text;
}

function startRecording() {
  finalTranscript = "";
  transcriptEl.textContent = "";
  transcriptCleanEl.textContent = "";

  recognition = new SpeechRecognition();
  recognition.lang = "en-US";
  recognition.continuous = true;
  recognition.interimResults = true;

  recognition.onresult = (event) => {
    let interim = "";
    for (let i = event.resultIndex; i < event.results.length; i++) {
      const chunk = event.results[i][0].transcript;
      if (event.results[i].isFinal) {
        finalTranscript += chunk + " ";
      } else {
        interim += chunk;
      }
    }
    transcriptEl.textContent = (finalTranscript + interim).trim();
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
      const cleaned = window.BravaCleanup
        ? window.BravaCleanup.cleanTranscript(finalTranscript.trim())
        : finalTranscript.trim();
      transcriptCleanEl.textContent = cleaned;
      setStatus(finalTranscript.trim() ? "Captured — tap to speak again" : "Tap to speak");
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

  const cleaned = window.BravaCleanup
    ? window.BravaCleanup.cleanTranscript(finalTranscript.trim())
    : finalTranscript.trim();
  transcriptCleanEl.textContent = cleaned;

  setStatus(finalTranscript.trim() ? "Captured — tap to speak again" : "Tap to speak");
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
