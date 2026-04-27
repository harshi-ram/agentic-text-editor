import { Dispatch, SetStateAction } from "react";

interface EditorProps {
  text: string;
  setText: Dispatch<SetStateAction<string>>;
}

export default function Editor({ text, setText }: EditorProps) {
  const wordCount = text.trim() ? text.trim().split(/\s+/).length : 0;
  const charCount = text.length;

  return (
    <div className="editor-pane">
      <div className="editor-header">
        <span className="editor-title">Document</span>
        <span className="word-count">{wordCount} {wordCount !== 1 ? "words" : "word"} · {charCount} chars</span>
      </div>
      <textarea
        className="editor-textarea"
        value={text}
        onChange={e => setText(e.target.value)}
        placeholder="Start writing or paste your text here…"
      />
    </div>
  );
}