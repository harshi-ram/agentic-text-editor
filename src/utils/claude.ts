// Rule-based grammar and style checker
import { COMMON_WORDS } from "./wordlist";

function getRealWordRatio(text: string): number {
  const words = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  if (words.length === 0) return 1;
  const realCount = words.filter((w: string) => COMMON_WORDS.has(w)).length;
  return realCount / words.length;
}

interface RuleMatch {
  original: string;
  suggestion: string;
  reason: string;
}

interface GrammarRule {
  pattern: RegExp;
  message: (m: string) => RuleMatch;
}

const RULES: GrammarRule[] = [
  // Double spaces
  { pattern: /  +/g, message: (m: string) => ({ original: m, suggestion: " ", reason: "Remove extra spaces." }) },
  // Passive voice indicators
  { pattern: /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi, message: (m: string) => ({ original: m, suggestion: m, reason: `Possible passive voice: "${m}". Consider rewriting actively.` }) },
  // Repeated words
  { pattern: /\b(\w+)\s+\1\b/gi, message: (m: string) => { const w = m.split(/\s+/)[0]; return { original: m, suggestion: w, reason: `Repeated word: "${w}".` }; } },
  // Weak words
  { pattern: /\b(very|really|quite|basically|literally|just|actually|stuff|things?)\b/gi, message: (m: string) => ({ original: m, suggestion: "", reason: `Weak/filler word: "${m}". Consider removing or replacing.` }) },
  // Sentence starting with "And" or "But"
  { pattern: /(?:^|[.!?]\s+)(And|But)\s/gm, message: (m: string) => ({ original: m.trim(), suggestion: m.trim(), reason: `Avoid starting a sentence with "${m.trim().split(" ")[0]}".` }) },
  // Comma splice simple check: ", and" overuse
  { pattern: /,\s*and\s+/gi, message: (m: string) => ({ original: m, suggestion: m, reason: 'Overuse of ", and" — consider splitting into two sentences.' }) },
  // Capitalization after period
  { pattern: /[.!?]\s+[a-z]/g, message: (m: string) => ({ original: m, suggestion: m.slice(0, -1) + m.slice(-1).toUpperCase(), reason: "Capitalize the first word after a sentence-ending punctuation." }) },
  // Multiple punctuation
  { pattern: /[!?]{2,}/g, message: (m: string) => ({ original: m, suggestion: m[0], reason: "Avoid multiple punctuation marks." }) },
];

export function checkGrammar(text: string) {
  const issues = [];
  const seen = new Set();

  for (const rule of RULES) {
    const matches = [...text.matchAll(rule.pattern)];
    for (const match of matches) {
      const result = rule.message(match[0]);
      const key = result.original + result.reason;
      if (!seen.has(key)) {
        seen.add(key);
        issues.push(result);
      }
      if (issues.length >= 8) break;
    }
    if (issues.length >= 8) break;
  }

  const realWordRatio = getRealWordRatio(text);
  const gibberishPenalty = realWordRatio < 0.4 ? Math.round((1 - realWordRatio) * 80) : 0;
  const issuePenalty = Math.min(issues.length * 10, 60);
  const score = Math.max(100 - issuePenalty - gibberishPenalty, 0);

  const gibberishWarning = realWordRatio < 0.4
    ? [{ original: text.slice(0, 30) + "…", suggestion: "", reason: `Only ${Math.round(realWordRatio * 100)}% of words appear to be valid English.` }]
    : [];

  return { score, issues: [...gibberishWarning, ...issues] };
}