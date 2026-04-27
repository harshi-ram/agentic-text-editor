const toneColors: { [key: string]: string } = {
  formal: "#185FA5", academic: "#185FA5",
  casual: "#3B6D11", friendly: "#3B6D11",
  neutral: "#5F5E5A",
  negative: "#A32D2D", assertive: "#993C1D",
  persuasive: "#854F0B", emotional: "#993556",
};

interface ToneBadgeProps {
  tone: string;
}

function ToneBadge({ tone }: ToneBadgeProps) {
  const color = toneColors[tone.toLowerCase()] || "#5F5E5A";
  return (
    <span className="tone-badge" style={{ color, background: `${color}18`, border: `1px solid ${color}33` }}>
      {tone}
    </span>
  );
}

interface ToneResult {
  primary: string;
  tones: string[];
  scores: { [key: string]: number };
  summary: string;
}

interface ToneTabProps {
  result: ToneResult | null;
}

export default function ToneTab({ result }: ToneTabProps) {
  return (
    <div>
      <p className="tab-desc">Detects tone based on keyword and sentence pattern analysis.</p>
      {result && (
        <>
          <div className="tone-card">
            <p className="tone-card-label">Primary tone</p>
            <ToneBadge tone={result.primary} />
          </div>
          <div className="tone-card">
            <p className="tone-card-label">All detected signals</p>
            <div className="tone-badges">
              {result.tones.map((t, i) => <ToneBadge key={i} tone={t} />)}
            </div>
          </div>
          <div className="tone-card">
            <p className="tone-card-label">Breakdown</p>
            {Object.entries(result.scores).map(([k, v]: [string, number]) => (
              <div key={k} style={{ marginBottom: 8 }}>
                <div style={{ display: "flex", justifyContent: "space-between", fontSize: 12, marginBottom: 3 }}>
                  <span style={{ textTransform: "capitalize", color: "#6b7280" }}>{k}</span>
                  <span style={{ fontWeight: 500 }}>{v}%</span>
                </div>
                <div style={{ background: "#e5e7eb", borderRadius: 4, height: 5 }}>
                  <div style={{ width: `${v}%`, background: toneColors[k] || "#888", borderRadius: 4, height: 5 }} />
                </div>
              </div>
            ))}
          </div>
          <p className="tone-summary">{result.summary}</p>
        </>
      )}
    </div>
  );
}