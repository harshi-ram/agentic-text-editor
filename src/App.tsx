import { useState } from "react";
import Editor from "./components/Editor";
import Sidebar from "./components/Sidebar";
import AgentPanel from "./components/AgentPanel";
import "./App.css";

export default function App() {
  const [text, setText] = useState("");
  const [improvedText, setImprovedText] = useState("");

  return (
    <div className="app">
      <Editor text={text} setText={setText} />
      <Sidebar text={text} setText={setText} />
      <AgentPanel text={text} improvedText={improvedText} setImprovedText={setImprovedText} />
    </div>
  );
}