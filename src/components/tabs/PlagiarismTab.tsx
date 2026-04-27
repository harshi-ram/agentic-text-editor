import { Dispatch, SetStateAction } from "react";

interface SimilarityBarProps {
  score: number;
}

function SimilarityBar({ score }: SimilarityBarProps) {
  const pct = Math.round(score * 100);
  const color = pct > 60 ? "#dc2626" : pct > 30 ? "#ea580c" : "#16a34a";
  return (
    <div style={{ marginBottom: 12 }}>
      <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, fontWeight: 600, marginBottom: 5 }}>
        <span>Similarity Score</span>
        <span>{pct}%</span>
      </div>
      <div style={{ background: "#e5e7eb", borderRadius: 10, height: 8, overflow: "hidden" }}>
        <div style={{ width: `${pct}%`, background: color, height: "100%", transition: "width 0.5s ease-out" }} />
      </div>
    </div>
  );
}

interface PlagiarismTabProps {
  result: {
    similarityScore: number;
    verdict: string;
    matches: string[];
  } | null;
  refText: string;
  setRefText: Dispatch<SetStateAction<string>>;
}

export default function PlagiarismTab({ result, refText, setRefText }: PlagiarismTabProps) {
  return (
    <div>
      <p className="tab-desc">Paste a reference text below. The checker compares n-gram overlaps between your document and the reference.</p>
      <textarea
        className="ref-textarea"
        value={refText}
        onChange={e => setRefText(e.target.value)}
        placeholder="Paste reference text here…"
      />
      {result && (
        <div style={{ marginTop: 14 }}>
          <SimilarityBar score={result.similarityScore} />
          <p className="verdict">{result.verdict}</p>
          {result.matches.length > 0 && (
            <>
              <p className="matches-label">Matching phrases</p>
              {result.matches.map((m: string, i: number) => (
                <div key={i} className="match-card">
                  <p className="match-submitted"><span className="match-meta">Found: </span>{m}</p>
                </div>
              ))}
            </>
          )}
        </div>
      )}
    </div>
  );
}