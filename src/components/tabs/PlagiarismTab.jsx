function SimilarityBar({ score }) {
  const pct = Math.round(score * 100);
  const color = pct > 60 ? "#A32D2D" : pct > 30 ? "#854F0B" : "#3B6D11";
  return (
    <div className="similarity-bar-wrapper">
      <div className="similarity-bar-header">
        <span className="similarity-label">Similarity</span>
        <span className="similarity-pct" style={{ color }}>{pct}%</span>
      </div>
      <div className="similarity-track">
        <div className="similarity-fill" style={{ width: `${pct}%`, background: color }} />
      </div>
    </div>
  );
}

export default function PlagiarismTab({ result, refText, setRefText }) {
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
              {result.matches.map((m, i) => (
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