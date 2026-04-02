import { useState } from "react";
import { checkGrammar } from "../utils/grammar";
import { analyzeTone } from "../utils/tone";
import { checkPlagiarism } from "../utils/plagiarism";
import GrammarTab from "./tabs/GrammarTab";
import ToneTab from "./tabs/ToneTab";
import PlagiarismTab from "./tabs/PlagiarismTab";

const TABS = ["Grammar", "Tone", "Plagiarism"];

export default function Sidebar({ text, setText }) {
  const [activeTab, setActiveTab] = useState("Grammar");
  const [grammar, setGrammar] = useState(null);
  const [tone, setTone] = useState(null);
  const [plagiarism, setPlagiarism] = useState(null);
  const [refText, setRefText] = useState("");

  const [loading, setLoading] = useState(false);

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