// Strips common spoken filler words/phrases from a transcript.
// Deliberately conservative: removes filler only, doesn't rewrite grammar,
// doesn't shorten or paraphrase the actual idea. That upgrade is a later milestone.

const FILLER_PHRASES = [
  "so basically",
  "you know what i mean",
  "if that makes sense",
  "kind of like",
  "sort of like",
];

// Word-boundary fillers that can appear standalone anywhere in a sentence.
const FILLER_WORDS = [
  "um+",
  "uh+",
  "uhh+",
  "erm+",
  "like",
  "you know",
  "i mean",
  "basically",
  "actually",
  "literally",
  "kind of",
  "sort of",
  "right\\?", // trailing "...right?" filler tag
];

function buildFillerRegex(list) {
  const pattern = list
    .map((phrase) => phrase.replace(/[.*+?^${}()|[\]\\]/g, (m) => (m === "+" ? m : `\\${m}`)))
    .join("|");
  return new RegExp(`\\b(${pattern})\\b`, "gi");
}

const phraseRegex = buildFillerRegex(FILLER_PHRASES);
const wordRegex = buildFillerRegex(FILLER_WORDS);

function cleanTranscript(rawText) {
  if (!rawText) return "";

  let text = rawText;

  // Remove longer filler phrases first so they don't get partially matched
  // by the shorter word-level patterns.
  text = text.replace(phraseRegex, "");
  text = text.replace(wordRegex, "");

  // Collapse leftover double spaces, stray commas, and space-before-punctuation
  // artifacts created by removing words mid-sentence.
  text = text
    .replace(/\s{2,}/g, " ")
    .replace(/\s+([,.!?])/g, "$1")
    .replace(/,\s*,/g, ",")
    .replace(/^\s*[,.]\s*/, "")
    .trim();

  return text;
}

// Exposed as a global for app.js (no bundler in this project yet).
window.BravaCleanup = { cleanTranscript };
