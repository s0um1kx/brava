const FILLER_WORDS = ["um", "umm", "uh", "uhh", "erm", "hmm"];

const FILLER_PHRASES = ["you know", "i mean", "sort of", "kind of", "so basically", "basically"];

export function cleanTranscript(raw: string): string {
  let text = raw.trim();

  // 1. Strip stand-alone filler words (whole-word match only, so "umbrella" is untouched)
  for (const word of FILLER_WORDS) {
    text = text.replace(new RegExp(`\\b${word}\\b`, "gi"), "");
  }

  // 2. Strip filler phrases
  for (const phrase of FILLER_PHRASES) {
    text = text.replace(new RegExp(`\\b${phrase}\\b`, "gi"), "");
  }

  // 3. Collapse adjacent duplicate single words: "the the onboarding" -> "the onboarding"
  text = text.replace(/\b(\w+)(\s+\1\b)+/gi, "$1");

  // 4. Collapse adjacent duplicate short phrases (2-4 words): recognition-stutter repeats
  text = dedupeAdjacentPhrases(text, 4);

  // 5. Clean up whitespace/punctuation left behind by the removals above
  text = text.replace(/\s+/g, " ");
  text = text.replace(/\s+([.,!?])/g, "$1");

  return text.trim();
}

function dedupeAdjacentPhrases(text: string, maxPhraseLength: number): string {
  const words = text.split(/\s+/).filter(Boolean);
  const result: string[] = [];

  let i = 0;
  while (i < words.length) {
    let matched = false;
    for (let len = maxPhraseLength; len >= 2; len--) {
      if (i + len * 2 <= words.length) {
        const phraseA = words.slice(i, i + len).join(" ").toLowerCase();
        const phraseB = words.slice(i + len, i + len * 2).join(" ").toLowerCase();
        if (phraseA === phraseB) {
          result.push(...words.slice(i, i + len));
          i += len * 2;
          matched = true;
          break;
        }
      }
    }
    if (!matched) {
      result.push(words[i]);
      i += 1;
    }
  }

  return result.join(" ");
}