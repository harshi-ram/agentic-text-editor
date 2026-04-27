import { useState, Dispatch, SetStateAction } from "react";
import { checkGrammar } from "../utils/grammar";
import { analyzeTone } from "../utils/tone";
import { checkPlagiarism } from "../utils/plagiarism";
import GrammarTab from "./tabs/GrammarTab";
import ToneTab from "./tabs/ToneTab";
import PlagiarismTab from "./tabs/PlagiarismTab";

const TABS = ["Grammar", "Tone", "Plagiarism"];

interface GrammarResult {
  score: number;
  issues: { original: string; suggestion: string; reason: string }[];
}

interface ToneResult {
  primary: string;
  tones: string[];
  scores: { [key: string]: number };
  summary: string;
}

interface PlagiarismResult {
  similarityScore: number;
  verdict: string;
  matches: string[];
}

interface SidebarProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
}

export default function Sidebar({ text, setText }: SidebarProps) {
  const [activeTab, setActiveTab] = useState<string>("Grammar");
  const [grammar, setGrammar] = useState<GrammarResult | null>(null);
  const [tone, setTone] = useState<ToneResult | null>(null);
  const [plagiarism, setPlagiarism] = useState<PlagiarismResult | null>(null);
  const [refText, setRefText] = useState<string>("");

  const [loading, setLoading] = useState<boolean>(false);

  const handleAnalyze = async () => {
    if (!text.trim()) return;
    setLoading(true);
    try {
      if (activeTab === "Grammar") setGrammar(checkGrammar(text));
      else if (activeTab === "Tone") setTone(await analyzeTone(text));
      else if (refText.trim()) setPlagiarism(checkPlagiarism(text, refText));
    } catch (e) {
      console.error(e);
    }
    setLoading(false);
  };

  const canAnalyze =
    text.trim().length > 0 &&
    (activeTab !== "Plagiarism" || refText.trim().length > 0);

  return (
    <div className="sidebar">
      <div className="tabs">
        {TABS.map(tab => (
          <button
            key={tab}
            className={`tab-btn ${activeTab === tab ? "active" : ""}`}
            onClick={() => setActiveTab(tab)}
          >
            {tab}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {activeTab === "Grammar" && <GrammarTab result={grammar} setText={setText} text={text} />}
        {activeTab === "Tone" && <ToneTab result={tone} />}
        {activeTab === "Plagiarism" && (
          <PlagiarismTab result={plagiarism} refText={refText} setRefText={setRefText} />
        )}
      </div>

      <div className="sidebar-footer">
        <button
          className={`analyze-btn ${canAnalyze ? "enabled" : ""}`}
          onClick={handleAnalyze}
          disabled={!canAnalyze || loading}
        >
          {loading ? "Analyzing…" : `Analyze ${activeTab}`}
        </button>
      </div>
    </div>
  );
}