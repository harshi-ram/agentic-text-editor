export default function GrammarTab({ result, setText }) {
  const applyFix = (original, suggestion) =>
    setText(prev => prev.replace(original, suggestion));

  return (
    <div>
      <p className="tab-desc">Rule-based grammar and style checker. Click "Analyze Grammar" to scan your text.</p>
      {result && (
        <>
          <div className="score-card">
            <span className="score-label">Quality score</span>
            <span
              className="score-value"
              style={{ color: result.score >= 80 ? "#3B6D11" : result.score >= 50 ? "#854F0B" : "#A32D2D" }}
            >
              {result.score} / 100
            </span>
          </div>
          {result.issues.length === 0
            ? <p className="success-msg">No issues found!</p>
            : result.issues.map((issue, i) => (
              <div key={i} className="issue-card">
                <p className="issue-original">{issue.original}</p>
                <p className="issue-suggestion">→ {issue.suggestion}</p>
                <p className="issue-reason">{issue.reason}</p>
                {issue.original !== issue.suggestion && (
                  <button className="fix-btn" onClick={() => applyFix(issue.original, issue.suggestion)}>
                    Apply fix
                  </button>
                )}
              </div>
            ))
          }
        </>
      )}
    </div>
  );
}