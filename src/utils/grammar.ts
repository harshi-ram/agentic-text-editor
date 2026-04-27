import words from "an-array-of-english-words";

const WORD_SET = new Set(words);

function getRealWordRatio(text: string): number {
  const tokens = text.toLowerCase().match(/\b[a-z]+\b/g) || [];
  if (tokens.length === 0) return 1;
  const realCount = tokens.filter((w: string) => WORD_SET.has(w)).length;
  return realCount / tokens.length;
}

const RULES = [
  // Lowercase "i" as standalone pronoun
  {
    pattern: /(?<!\w)i(?!\w)/g,
    message: (m: string) => ({ original: m, suggestion: "I", reason: 'The pronoun "I" must always be capitalized.' })
  },
  // Double spaces
  {
    pattern: /  +/g,
    message: (m: string) => ({ original: m, suggestion: " ", reason: "Remove extra spaces." })
  },
  // Repeated words
  {
    pattern: /\b(\w+)\s+\1\b/gi,
    message: (m: string) => { const w = m.split(/\s+/)[0]; return { original: m, suggestion: w, reason: `Repeated word: "${w}".` }; }
  },
  // Capitalization after period/!/? 
  {
    pattern: /([.!?])\s+([a-z])/g,
    message: (m: string) => ({ original: m, suggestion: m.slice(0, -1) + m.slice(-1).toUpperCase(), reason: "Capitalize the first word after a sentence-ending punctuation." })
  },
  // Capitalization at start of text
  {
    pattern: /^[a-z]/gm,
    message: (m: string) => ({ original: m, suggestion: m.toUpperCase(), reason: "The first word of your text should be capitalized." })
  },
  // Missing space after comma
  {
    pattern: /,(?!\s)(?![0-9])/g,
    message: (m: string) => ({ original: m, suggestion: ", ", reason: "Add a space after a comma." })
  },
  // Missing space after period (not decimals)
  {
    pattern: /\.(?![0-9\s\n])[A-Za-z]/g,
    message: (m: string) => ({ original: m, suggestion: m[0] + " " + m[1], reason: "Add a space after a period." })
  },
  // Passive voice
  {
    pattern: /\b(is|are|was|were|be|been|being)\s+\w+ed\b/gi,
    message: (m: string) => ({ original: m, suggestion: m, reason: `Possible passive voice: "${m}". Consider rewriting actively.` })
  },
  // Weak/filler words
  {
    pattern: /\b(very|really|quite|basically|literally|just|actually|stuff|things?|sort of|kind of|a lot)\b/gi,
    message: (m: string) => ({ original: m, suggestion: "", reason: `Weak/filler word: "${m}". Consider removing or replacing with something stronger.` })
  },
  // Sentence starting with "And", "But", "So", "Because"
  {
    pattern: /(?:^|[.!?]\s+)(And|But|So|Because)\s/gm,
    message: (m: string) => ({ original: m.trim(), suggestion: m.trim(), reason: `Avoid starting a sentence with "${m.trim().split(" ")[0]}".` })
  },
  // Multiple punctuation
  {
    pattern: /[!?]{2,}/g,
    message: (m: string) => ({ original: m, suggestion: m[0], reason: "Avoid multiple punctuation marks in a row." })
  },
  // their/there confusion
  {
    pattern: /\btheir\s+is\b/gi,
    message: (m: string) => ({ original: m, suggestion: "there is", reason: '"Their" is possessive. Did you mean "there is"?' })
  },
  {
    pattern: /\bthere\s+(car|house|dog|cat|book|bag|phone|idea|opinion|work|job)\b/gi,
    message: (m: string) => ({ original: m, suggestion: "their " + m.split(/\s+/)[1], reason: '"There" refers to a place. Did you mean "their"?' })
  },
  // your/you're confusion
  {
    pattern: /\byour\s+(going|coming|right|wrong|doing|being|saying|trying|getting|making)\b/gi,
    message: (m: string) => ({ original: m, suggestion: "you're " + m.split(/\s+/)[1], reason: '"Your" is possessive. Did you mean "you\'re" (you are)?' })
  },
  {
    pattern: /\byou're\s+(car|house|dog|cat|book|bag|phone|friend|family|name)\b/gi,
    message: (m: string) => ({ original: m, suggestion: "your " + m.split(/\s+/)[1], reason: '"You\'re" means "you are". Did you mean "your"?' })
  },
  // its/it's confusion
  {
    pattern: /\bits\s+(going|coming|doing|being|raining|getting|making|working)\b/gi,
    message: (m: string) => ({ original: m, suggestion: "it's " + m.split(/\s+/)[1], reason: '"Its" is possessive. Did you mean "it\'s" (it is)?' })
  },
  {
    pattern: /\bit's\s+(own|color|size|shape|name|value|purpose)\b/gi,
    message: (m: string) => ({ original: m, suggestion: "its " + m.split(/\s+/)[1], reason: '"It\'s" means "it is". Did you mean "its" (possessive)?' })
  },
  // then/than confusion
  {
    pattern: /\bthen\s+(me|him|her|us|them|I)\b/gi,
    message: (m: string) => ({ original: m, suggestion: "than " + m.split(/\s+/)[1], reason: '"Then" refers to time. Did you mean "than" for comparison?' })
  },
  // effect/affect confusion
  {
    pattern: /\beffect\s+(the|a|an|this|that|these|those)\b/gi,
    message: (m: string) => ({ original: m, suggestion: "affect " + m.split(/\s+/)[1], reason: '"Effect" is usually a noun. Did you mean the verb "affect"?' })
  },
  // Double negatives
  {
    pattern: /\b(don't|doesn't|didn't|can't|won't|isn't|aren't|wasn't|weren't)\s+(no|nobody|nothing|nowhere|never|neither)\b/gi,
    message: (m: string) => ({ original: m, suggestion: m, reason: `Possible double negative: "${m}". This may convey the opposite meaning.` })
  },
  // "a" vs "an" before vowels
  {
    pattern: /\ba\s+[aeiou]/gi,
    message: (m: string) => ({ original: m.trim(), suggestion: "an " + m.trim().split(/\s+/)[1], reason: `Use "an" before words starting with a vowel sound.` })
  },
  // "an" before consonants
  {
    pattern: /\ban\s+[^aeiou\s]/gi,
    message: (m: string) => {
      const word = m.trim().split(/\s+/)[1] || "";
      const vowelSoundExceptions = ["honest", "honor", "hour", "heir"];
      if (vowelSoundExceptions.some(e => word.toLowerCase().startsWith(e))) return null;
      return { original: m.trim(), suggestion: "a " + word, reason: `Use "a" before words starting with a consonant sound.` };
    }
  },
  // Wordy phrases
  {
    pattern: /\b(due to the fact that|in order to|at this point in time|in the event that|for the purpose of)\b/gi,
    message: (m: string) => {
      const replacements: { [key: string]: string } = {
        "due to the fact that": "because",
        "in order to": "to",
        "at this point in time": "now",
        "in the event that": "if",
        "for the purpose of": "to",
      };
      const suggestion = replacements[m.toLowerCase()] || m;
      return { original: m, suggestion, reason: `Wordy phrase. Replace "${m}" with "${suggestion}".` };
    }
  },
  // Comma splice
  {
    pattern: /[a-z],\s+[A-Z][a-z]/g,
    message: (m: string) => ({ original: m, suggestion: m, reason: "Possible comma splice. Consider using a semicolon, period, or conjunction." })
  },
  // Missing comma after salutation/introductory word
  {
    pattern: /^(Hello|Hi|Hey|Dear|Greetings|Welcome|Yes|No|Well|Now|Still|Also|Moreover|Furthermore|However|Therefore|Meanwhile|Otherwise|Instead|Finally|First|Second|Third|Lastly)\s+[A-Za-z]/gm,
    message: (m: string) => {
      const word = m.trim().split(/\s+/)[0];
      return { original: m.trim(), suggestion: word + ", " + m.trim().slice(word.length).trim(), reason: `Add a comma after the introductory word "${word}".` };
    }
  },
  // Missing period at end of text (last line doesn't end with punctuation)
  {
    pattern: /[a-zA-Z]$/gm,
    message: (m: string) => ({ original: m, suggestion: m + ".", reason: "Sentence may be missing a period at the end." })
  },
];

export interface GrammarIssue {
  original: string;
  suggestion: string;
  reason: string;
}

export interface GrammarResult {
  score: number;
  issues: GrammarIssue[];
}

export function checkGrammar(text: string): GrammarResult {
  const issues = [];
  const seen = new Set();

  for (const rule of RULES) {
    const matches = [...text.matchAll(rule.pattern)];
    for (const match of matches) {
      const result = rule.message(match[0]);
      if (!result) continue;
      const key = result.original + result.reason;
      if (!seen.has(key)) {
        seen.add(key);
        issues.push(result);
      }
      if (issues.length >= 12) break;
    }
    if (issues.length >= 12) break;
  }

  const realWordRatio = getRealWordRatio(text);
  const gibberishPenalty = realWordRatio < 0.4 ? Math.round((1 - realWordRatio) * 80) : 0;
  const issuePenalty = Math.min(issues.length * 8, 70);
  const score = Math.max(100 - issuePenalty - gibberishPenalty, 0);

  const gibberishWarning = realWordRatio < 0.4
    ? [{ original: text.slice(0, 30) + "…", suggestion: "", reason: `Only ${Math.round(realWordRatio * 100)}% of words appear to be valid English.` }]
    : [];

  return { score, issues: [...gibberishWarning, ...issues] };
}