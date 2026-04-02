// N-gram based plagiarism checker

function getNgrams(text, n) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const ngrams = new Set();
  for (let i = 0; i <= words.length - n; i++) {
    ngrams.add(words.slice(i, i + n).join(" "));
  }
  return ngrams;
}

function getPhrasesFromText(text, n) {
  const words = text.toLowerCase().match(/\b\w+\b/g) || [];
  const phrases = [];
  for (let i = 0; i <= words.length - n; i++) {
    phrases.push(words.slice(i, i + n).join(" "));
  }
  return phrases;
}

export function checkPlagiarism(submitted, reference, n = 5) {
  const submittedNgrams = getNgrams(submitted, n);
  const referenceNgrams = getNgrams(reference, n);

  if (submittedNgrams.size === 0) {
    return { similarityScore: 0, verdict: "Not enough text to analyze.", matches: [] };
  }

  // Jaccard similarity
  const intersection = [...submittedNgrams].filter(g => referenceNgrams.has(g));
  const union = new Set([...submittedNgrams, ...referenceNgrams]);
  const similarityScore = intersection.length / union.size;

  // Find matching phrases in original casing
  const submittedPhrases = getPhrasesFromText(submitted, n);
  const matchSet = new Set(intersection);
  const matches = [];
  const seen = new Set();

  for (const phrase of submittedPhrases) {
    if (matchSet.has(phrase) && !seen.has(phrase)) {
      seen.add(phrase);
      matches.push(phrase);
      if (matches.length >= 6) break;
    }
  }

  const pct = Math.round(similarityScore * 100);
  const verdict =
    pct > 60 ? "High similarity detected. Large portions may be copied."
    : pct > 30 ? "Moderate similarity found. Some phrases overlap with the reference."
    : pct > 10 ? "Low similarity. A few phrases match the reference."
    : "Very low similarity. Texts appear largely original.";

  return { similarityScore, verdict, matches };
}