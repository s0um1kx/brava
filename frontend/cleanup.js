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

// Speech recognition (especially continuous mode on mobile) sometimes
// re-guesses overlapping audio as separate finalized segments, producing
// stutter like "I am am in in sitting sitting" or whole repeated phrases.
// This collapses any phrase (1 word up to half the transcript) that
// immediately repeats itself, down to a single occurrence.
function dedupeAdjacentPhrases(text) {
  let words = text.split(/\s+/).filter(Boolean);
  let changed = true;

  while (changed) {
    changed = false;

    for (let len = Math.floor(words.length / 2); len >= 1 && !changed; len--) {
      for (let i = 0; i + 2 * len <= words.length; i++) {
        const a = words.slice(i, i + len).join(" ").toLowerCase();
        const b = words.slice(i + len, i + 2 * len).join(" ").toLowerCase();

        if (a === b) {
          words.splice(i + len, len); // drop the repeated occurrence
          changed = true;
          break;
        }
      }
    }
  }

  return words.join(" ");
}

function cleanTranscript(rawText) {
  if (!rawText) return "";

  let text = dedupeAdjacentPhrases(rawText);

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
