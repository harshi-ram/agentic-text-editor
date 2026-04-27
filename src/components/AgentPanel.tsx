import { useState, useRef, useEffect } from "react";
import { runAgent } from "../utils/agent";

interface AgentPanelProps {
  text: string;
  improvedText: string;
  setImprovedText: (text: string) => void;
}

export default function AgentPanel({ text, improvedText, setImprovedText }: AgentPanelProps) {
  const [running, setRunning] = useState<boolean>(false);
  const [log, setLog] = useState<string[]>([]);
  const logRef = useRef<HTMLDivElement>(null);

  const addLog = (msg: string) => setLog(prev => [...prev, msg]);

  useEffect(() => {
    if (logRef.current) logRef.current.scrollTop = logRef.current.scrollHeight;
  }, [log]);

  const handleRun = async () => {
    if (!text.trim()) return;
    setLog([]);
    setImprovedText("");
    setRunning(true);
    await runAgent(text, addLog, setImprovedText);
    setRunning(false);
  };

  const handleApply = () => {
    // parent could wire this to setText if desired
    alert("Copy the improved text above and paste it into the editor!");
  };

  return (
    <div className="agent-panel">
      <div className="agent-header">
        <span className="agent-title">AI Agent</span>
        <span className="agent-subtitle">Autonomous multi-pass text improver</span>
      </div>

      <div className="agent-body">
        <button
          className={`run-btn ${!running && text.trim() ? "enabled" : ""}`}
          onClick={handleRun}
          disabled={running || !text.trim()}
        >
          {running ? "Agent running…" : "▶ Run Agent"}
        </button>

        {log.length > 0 && (
          <>
            <p className="agent-section-label">Agent log</p>
            <div className="agent-log" ref={logRef}>
              {log.map((entry, i) => (
                <p key={i} className="log-entry">{entry}</p>
              ))}
            </div>
          </>
        )}

        {improvedText && (
          <>
            <p className="agent-section-label">Improved text</p>
            <div className="agent-result">{improvedText}</div>
            <button className="apply-btn" onClick={handleApply}>
              Apply to editor
            </button>
          </>
        )}
      </div>
    </div>
  );
}