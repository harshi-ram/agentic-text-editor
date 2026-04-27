const OLLAMA_URL = "http://localhost:11434/api/generate";
const MODEL = "llama3.2";

async function runPrompt(prompt: string, onLog: (msg: string) => void): Promise<string> {
  const res = await fetch(OLLAMA_URL, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ model: MODEL, prompt, stream: false }),
  });

  if (!res.ok) throw new Error("Ollama request failed. Is Ollama running?");
  const data = await res.json();
  return data.response?.trim() || "";
}

export async function runAgent(text: string, onLog: (msg: string) => void, onResult: (result: string) => void): Promise<void> {
  onLog("🔌 Connecting to Ollama...");

  // Test connection
  try {
    await fetch("http://localhost:11434");
    onLog("✅ Connected to Ollama.");
  } catch {
    onLog("❌ Could not connect to Ollama. Make sure it is running (ollama serve).");
    return;
  }

  let current = text;
  const MAX_PASSES = 2;

  for (let pass = 1; pass <= MAX_PASSES; pass++) {
    onLog(`\n🔍 Pass ${pass} — Analyzing text...`);

    const issuePrompt = `You are a grammar checker. List only the grammar and spelling issues in this text as a short bullet list. Text: "${current}"`;
    const issues = await runPrompt(issuePrompt, onLog);
    onLog(`📋 Issues found: ${issues}`);

    const decidePrompt = `Does this text have grammar or spelling errors? Reply with only the single word "yes" or "no". Text: "${current}"`;
    const decision = await runPrompt(decidePrompt, onLog);
    onLog(`🤔 Agent decision: ${decision}`);

    if (decision.toLowerCase().startsWith("no")) {
      onLog("✅ Agent is satisfied with the text. Stopping.");
      break;
    }

    onLog("🔧 Fixing grammar...");
    const grammarFixed = await runPrompt(
      `You are a grammar corrector. Fix only the grammar and spelling errors in the following text. Do not add new content. Do not explain anything. Output only the corrected sentence(s).\n\nText: ${current}`,
      onLog
    );
    onLog(`📝 After grammar fix: ${grammarFixed}`);
    current = grammarFixed;

    onLog("✨ Improving clarity...");
    const clarityFixed = await runPrompt(
      `You are an editor. Make the following text clearer and more concise. Do not add new content. Output only the improved text.\n\nText: ${current}`,
      onLog
    );
    onLog(`📝 After clarity pass: ${clarityFixed}`);
    current = clarityFixed;

    onLog("🎨 Improving tone...");
    const toneFixed = await runPrompt(
      `You are a writing assistant. Improve the tone of the following text to sound more professional. Do not add new content. Output only the improved text.\n\nText: ${current}`,
      onLog
    );
    onLog(`📝 After tone pass: ${toneFixed}`);
    current = toneFixed;
  }

  onLog("\n🏁 Agent finished all passes.");
  onResult(current);
}